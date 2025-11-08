from typing import List, Optional
import httpx
from fastapi import HTTPException
from datetime import datetime
from app.database import transaccion_collection, PyObjectId
from app.models.transaccion import TransaccionModel
from app.schemas.transaccion import TransaccionCreateSchema
from app.services.direccion import fetch_and_save_direccion
from app.services.bloque import fetch_and_save_bloque

async def get_all_transacciones() -> List[TransaccionModel]:
    docs = await transaccion_collection.find().to_list(100)
    return [TransaccionModel(**doc) for doc in docs]

async def create_transaccion(data: TransaccionCreateSchema) -> TransaccionModel:
    # Resolve inputs and outputs to get their ObjectIds
    inputs_ids = [
        (await fetch_and_save_direccion(addr)).id for addr in data.inputs
    ]
    outputs_ids = [
        (await fetch_and_save_direccion(addr)).id for addr in data.outputs
    ]

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

async def _fetch_raw_transactions_by_address(address: str, limit: int = 10) -> List[dict]:
    url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}/full?limit={limit}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            try:
                data = response.json()
            except ValueError:
                raise ValueError("La respuesta de la API no es JSON válido")

            if "error" in data:
                raise ValueError(data["error"])
        except httpx.HTTPStatusError as e:
            raise Exception(f"Error HTTP: {e.response.text}") from e
        except httpx.RequestError as e:
            raise Exception(f"Error de conexión con la API: {str(e)}") from e

    if "txs" in data:
        return data["txs"]
    else:
        return []

async def fetch_and_save_transactions_by_address(direccion: str):
    """
    Obtiene las transacciones de una dirección Bitcoin usando BlockCypher o Blockstream como respaldo.
    Guarda los resultados en MongoDB transformando los datos al formato de TransaccionModel.
    """
    print(f"🌐 [FETCH] Buscando transacciones para {direccion}")

    # --- URLs base ---
    url_blockcypher = f"https://api.blockcypher.com/v1/btc/main/addrs/{direccion}/full"
    url_blockstream = f"https://blockstream.info/api/address/{direccion}/txs"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://blockcypher.com/",
        "Connection": "keep-alive"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.get(url_blockcypher, headers=headers)
            if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("application/json"):
                data = resp.json()
                fuente = "blockcypher"
            else:
                raise Exception("Respuesta no JSON de BlockCypher")
        except Exception as e:
            print(f"⚠️ BlockCypher bloqueado: {e} → intentando Blockstream...")
            resp = await client.get(url_blockstream, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail="No se pudo obtener datos de ninguna API")
            data = resp.json()
            fuente = "blockstream"

    print(f"✅ Datos obtenidos de {fuente} ({len(data) if isinstance(data, list) else 1} registros)")

    # --- Normalizar estructura ---
    txs = data.get("txs", []) if isinstance(data, dict) else data

    for tx_data in txs:
        try:
            # 🧩 Obtener hash y fecha
            tx_hash = tx_data.get("txid") or tx_data.get("hash")
            if not tx_hash:
                continue

            if "status" in tx_data and tx_data["status"].get("block_time"):
                fecha = datetime.fromtimestamp(tx_data["status"]["block_time"])
            elif tx_data.get("confirmed"):
                fecha = datetime.fromisoformat(tx_data["confirmed"].replace("Z", "+00:00"))
            else:
                fecha = datetime.now()

            # 🔹 Inputs → extraer direcciones
            input_addrs = []
            for vin in tx_data.get("vin", []) or tx_data.get("inputs", []):
                prevout = vin.get("prevout") if "prevout" in vin else vin
                addr = prevout.get("scriptpubkey_address") or (vin.get("addresses", [None])[0] if vin.get("addresses") else None)
                if addr:
                    input_addrs.append(addr)

            # 🔹 Outputs → extraer direcciones
            output_addrs = []
            for vout in tx_data.get("vout", []) or tx_data.get("outputs", []):
                addr = vout.get("scriptpubkey_address") or (vout.get("addresses", [None])[0] if vout.get("addresses") else None)
                if addr:
                    output_addrs.append(addr)

            # 🔹 Calcular monto total
            monto_total = sum(v.get("value", 0) for v in tx_data.get("vout", []) or tx_data.get("outputs", [])) / 1e8
            estado = "confirmada" if tx_data.get("status", {}).get("confirmed") or tx_data.get("block_height") else "pendiente"
            block_hash = tx_data.get("status", {}).get("block_hash") or tx_data.get("block_hash")

            # 🔹 Crear doc limpio (compatible con TransaccionModel)
            transaccion_doc = {
                "hash": tx_hash,
                "fecha": fecha,
                "inputs": input_addrs,
                "outputs": output_addrs,
                "monto_total": monto_total,
                "estado": estado,
                "patrones_sospechosos": [],
                "bloque": block_hash,
                "fees": float(tx_data.get("fee", 0)) / 1e8,
                "confirmations": 1 if estado == "confirmada" else 0,
            }

            # Guardar en Mongo (sin romper duplicados)
            await transaccion_collection.update_one(
                {"hash": tx_hash},
                {"$set": transaccion_doc},
                upsert=True
            )

        except Exception as e:
            print(f"⚠️ Error al procesar transacción: {e}")

    print(f"💾 {len(txs)} transacciones procesadas y guardadas para {direccion}")
    return True

async def fetch_transactions_by_address(address: str) -> List[dict]:
    await fetch_and_save_transactions_by_address(address)
    return await _fetch_raw_transactions_by_address(address)

#obtener las transacciones desde la bd 
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