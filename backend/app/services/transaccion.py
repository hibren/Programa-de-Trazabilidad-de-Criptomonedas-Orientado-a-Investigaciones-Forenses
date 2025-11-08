from typing import List, Optional
import httpx
import json
from datetime import datetime
from app.database import transaccion_collection, PyObjectId
from app.models.transaccion import TransaccionModel
from app.schemas.transaccion import TransaccionCreateSchema
from app.services.direccion import fetch_and_save_direccion
from app.services.bloque import fetch_and_save_bloque
import os
import asyncio


# ================================================================
# 🔹 CONFIGURACIÓN DE BLOCKCYPHER
# ================================================================
BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"
BLOCKCYPHER_TOKEN = os.getenv("BLOCKCYPHER_TOKEN", "TOKEN")

#d210a6ac92274d61b1f15e2c3652bf57

# ================================================================
# 🔹 CRUD BÁSICO
# ================================================================
async def get_all_transacciones() -> List[TransaccionModel]:
    docs = await transaccion_collection.find().to_list(100)
    return [TransaccionModel(**doc) for doc in docs]


async def create_transaccion(data: TransaccionCreateSchema) -> TransaccionModel:
    inputs_ids = [(await fetch_and_save_direccion(addr)).id for addr in data.inputs]
    outputs_ids = [(await fetch_and_save_direccion(addr)).id for addr in data.outputs]

    transaccion_doc = {
        "hash": data.hash,
        "fecha": data.fecha,
        "inputs": inputs_ids,
        "outputs": outputs_ids,
        "monto_total": data.monto_total,
        "estado": data.estado,
        "patrones_sospechosos": data.patrones_sospechosos,
        "bloque": PyObjectId(data.bloque) if data.bloque and PyObjectId.is_valid(data.bloque) else None,
    }

    result = await transaccion_collection.insert_one(transaccion_doc)
    created = await transaccion_collection.find_one({"_id": result.inserted_id})
    return TransaccionModel(**created)


async def get_transaccion_by_hash(hash_str: str) -> Optional[TransaccionModel]:
    doc = await transaccion_collection.find_one({"hash": hash_str})
    return TransaccionModel(**doc) if doc else None


async def update_transaccion(transaccion_id: str, data: dict) -> Optional[TransaccionModel]:
    await transaccion_collection.update_one(
        {"_id": PyObjectId(transaccion_id)}, {"$set": data}
    )
    updated = await transaccion_collection.find_one({"_id": PyObjectId(transaccion_id)})
    return TransaccionModel(**updated) if updated else None


async def delete_transaccion(transaccion_id: str) -> int:
    result = await transaccion_collection.delete_one({"_id": PyObjectId(transaccion_id)})
    return result.deleted_count


# ================================================================
# 🔹 DESCARGA DESDE BLOCKCYPHER (ROBUSTA)
# ================================================================
async def _fetch_raw_transactions_by_address(address: str, limit: int = 5) -> List[dict]:
    """
    Consulta la API de BlockCypher con token, detecta bloqueos Cloudflare
    y reintenta automáticamente en caso de límite o respuesta HTML.
    """
    url = f"{BLOCKCYPHER_API}/addrs/{address}/full?limit={limit}&token={BLOCKCYPHER_TOKEN}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        "Connection": "keep-alive",
        "Referer": "https://live.blockcypher.com/",
        "Origin": "https://live.blockcypher.com",
    }

    await asyncio.sleep(1)  # pequeña pausa para evitar rate limit

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)

            # 🔸 Detección de bloqueo Cloudflare (HTML)
            content_type = response.headers.get("Content-Type", "")
            if "text/html" in content_type or "<!DOCTYPE html>" in response.text:
                print(f"⚠️ Cloudflare Challenge detectado para {address}. Esperando 60s...")
                await asyncio.sleep(60)
                return await _fetch_raw_transactions_by_address(address, limit)

            try:
                data = response.json()
            except json.JSONDecodeError:
                print(f"⚠️ Respuesta inválida para {address}, reintentando en 30s...")
                await asyncio.sleep(30)
                return await _fetch_raw_transactions_by_address(address, limit)

            # 🔸 Manejo de errores de API
            if "error" in data:
                if "Limits reached" in data["error"]:
                    print(f"⏳ Límite de API alcanzado para {address}. Esperando 60s...")
                    await asyncio.sleep(60)
                    return await _fetch_raw_transactions_by_address(address, limit)
                else:
                    raise Exception(f"Error en API BlockCypher: {data['error']}")

            return data.get("txs", [])

        except httpx.RequestError as e:
            print(f"⚠️ Error de conexión con BlockCypher: {e}")
            await asyncio.sleep(15)
            return await _fetch_raw_transactions_by_address(address, limit)
        except httpx.HTTPStatusError as e:
            print(f"⚠️ Error HTTP: {e.response.text}")
            await asyncio.sleep(15)
            return await _fetch_raw_transactions_by_address(address, limit)


# ================================================================
# 🔹 GUARDAR TRANSACCIONES EN MONGO
# ================================================================
async def fetch_and_save_transactions_by_address(address: str) -> List[TransaccionModel]:
    raw_txs = await _fetch_raw_transactions_by_address(address)
    saved_transactions = []

    for tx_data in raw_txs:
        tx_hash = tx_data.get("hash")
        if not tx_hash:
            continue

        existing_tx = await get_transaccion_by_hash(tx_hash)
        if existing_tx:
            saved_transactions.append(existing_tx)
            continue

        # Bloque asociado
        block_id = None
        block_hash = tx_data.get("block_hash")
        if block_hash:
            bloque = await fetch_and_save_bloque(block_hash)
            if bloque:
                block_id = bloque.id

        # Inputs
        input_ids = []
        for vin in tx_data.get("inputs", []):
            for addr in vin.get("addresses", []):
                if addr:
                    direccion = await fetch_and_save_direccion(addr)
                    input_ids.append(direccion.id)

        # Outputs
        output_ids = []
        for vout in tx_data.get("outputs", []):
            for addr in vout.get("addresses", []):
                if addr:
                    direccion = await fetch_and_save_direccion(addr)
                    output_ids.append(direccion.id)

        # Fecha
        fecha_str = tx_data.get("confirmed")
        fecha_obj = datetime.fromisoformat(fecha_str.replace("Z", "+00:00")) if fecha_str else datetime.now()

        # Crear documento de transacción
        transaccion_doc = {
            "hash": tx_hash,
            "fecha": fecha_obj,
            "inputs": input_ids,
            "outputs": output_ids,
            "monto_total": float(tx_data.get("total", 0)) / 100_000_000,  # satoshis → BTC
            "estado": "confirmada" if tx_data.get("block_height", -1) > 0 else "pendiente",
            "patrones_sospechosos": [],
            "bloque": block_id,
            "fees": float(tx_data.get("fees", 0)) / 100_000_000,
            "confirmations": int(tx_data.get("confirmations", 0)),
        }

        # Guardar en Mongo
        result = await transaccion_collection.insert_one(transaccion_doc)
        created = await transaccion_collection.find_one({"_id": result.inserted_id})
        if created:
            saved_transactions.append(TransaccionModel(**created))

    print(f"💾 Guardadas {len(saved_transactions)} transacciones nuevas para {address}")
    return saved_transactions


# ================================================================
# 🔹 UTILIDADES
# ================================================================
async def fetch_transactions_by_address(address: str) -> List[dict]:
    await fetch_and_save_transactions_by_address(address)
    return await _fetch_raw_transactions_by_address(address)


async def get_transacciones_by_direccion(direccion_id: str) -> List[TransaccionModel]:
    direccion_obj_id = PyObjectId(direccion_id)

    cursor = transaccion_collection.find({
        "$or": [
            {"inputs": direccion_obj_id},
            {"outputs": direccion_obj_id}
        ]
    })

    docs = await cursor.to_list(100)
    return [TransaccionModel(**doc) for doc in docs]
