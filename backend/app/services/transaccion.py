from typing import List, Optional
import httpx
import json
from datetime import datetime
from app.database import transaccion_collection, PyObjectId
from app.models.transaccion import TransaccionModel
from app.schemas.transaccion import TransaccionCreateSchema
from app.services.direccion import fetch_and_save_direccion
from app.services.bloque import fetch_and_save_bloque
import asyncio
import random


# ================================================================
# 🔹 CONFIGURACIÓN DE BLOCKCYPHER
# ================================================================
BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"

# 🔥 SOLUCIÓN: Rotación de tokens para evitar límites
BLOCKCYPHER_TOKENS = [
    "d210a6ac92274d61b1f15e2c3652bf57",
    "0da27d786bd94dbb89c7ca6d0274fc03",
]

def get_random_token():
    """Rotar entre múltiples tokens"""
    return random.choice(BLOCKCYPHER_TOKENS)


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
# 🔹 DESCARGA DESDE BLOCKCYPHER (CORREGIDA)
# ================================================================
async def _fetch_raw_transactions_by_address(address: str, limit: int = 5) -> List[dict]:
    """
    Consulta la API de BlockCypher con protección contra Cloudflare y rate limits.
    
    MEJORAS:
    - Rotación de tokens
    - Delay aleatorio para evitar patrones
    - Detección mejorada de Cloudflare
    - Sin duplicación de except
    """
    
    MAX_INTENTOS = 3
    BASE_DELAY = 5  # segundos
    
    for intento in range(MAX_INTENTOS):
        try:
            # 🔄 Usar token rotativo
            token = get_random_token()
            url = f"{BLOCKCYPHER_API}/addrs/{address}/full?limit={limit}&token={token}"
            
            # Headers más realistas (SIN Accept-Encoding para evitar problemas GZIP)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive",
            }
            
            # ⏱️ Delay aleatorio (2-5 segundos) para evitar detección de bot
            delay = random.uniform(2, 5)
            await asyncio.sleep(delay)
            
            print(f"🌐 [Intento {intento + 1}/{MAX_INTENTOS}] Consultando {address[:8]}... con token {token[-8:]}")
            
            # httpx descomprime automáticamente si no especificamos Accept-Encoding
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                
                # 🚨 DETECCIÓN MEJORADA DE CLOUDFLARE
                content_type = response.headers.get("Content-Type", "")
                response_text = response.text[:500]  # Primeros 500 caracteres
                
                # Verificar si es HTML de Cloudflare
                if any(indicator in response_text for indicator in [
                    "Just a moment",
                    "Cloudflare",
                    "challenge-platform",
                    "cf-chl-opt"
                ]):
                    print(f"🔒 Cloudflare detectado. Esperando {BASE_DELAY * (intento + 1)}s...")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                # Verificar que sea JSON válido
                if "application/json" not in content_type:
                    print(f"⚠️ Respuesta no es JSON: {content_type}")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                # Intentar parsear JSON
                try:
                    data = response.json()
                except json.JSONDecodeError as e:
                    print(f"❌ JSON inválido: {str(e)[:100]}")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                # Manejar errores de la API
                if "error" in data:
                    error_msg = data["error"]
                    
                    if "rate limit" in error_msg.lower() or "limit" in error_msg.lower():
                        print(f"⏳ Rate limit alcanzado. Esperando {BASE_DELAY * 2}s...")
                        await asyncio.sleep(BASE_DELAY * 2)
                        continue
                    
                    # Error no recuperable
                    print(f"❌ Error de API: {error_msg}")
                    return []
                
                # ✅ Respuesta exitosa
                response.raise_for_status()
                txs = data.get("txs", [])
                print(f"✅ Obtenidas {len(txs)} transacciones para {address[:8]}...")
                return txs
                
        except httpx.TimeoutException:
            print(f"⏱️ Timeout en intento {intento + 1}")
            await asyncio.sleep(BASE_DELAY * (intento + 1))
            
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            print(f"❌ HTTP {status}: {e.response.text[:200]}")
            
            if status == 429:  # Too Many Requests
                await asyncio.sleep(BASE_DELAY * 3)
            elif status >= 500:  # Server error
                await asyncio.sleep(BASE_DELAY * 2)
            else:
                break  # No reintentar para otros errores
                
        except Exception as e:
            print(f"⚠️ Error inesperado: {type(e).__name__}: {str(e)[:100]}")
            await asyncio.sleep(BASE_DELAY)
    
    print(f"❌ Fallaron todos los intentos para {address}")
    return []


# ================================================================
# 🔹 GUARDAR TRANSACCIONES EN MONGO
# ================================================================
async def fetch_and_save_transactions_by_address(address: str) -> List[TransaccionModel]:
    raw_txs = await _fetch_raw_transactions_by_address(address)
    
    if not raw_txs:
        print(f"⚠️ No se obtuvieron transacciones para {address}")
        return []
    
    saved_transactions = []

    for tx_data in raw_txs:
        tx_hash = tx_data.get("hash")
        if not tx_hash:
            continue

        # Verificar si ya existe
        existing_tx = await get_transaccion_by_hash(tx_hash)
        if existing_tx:
            saved_transactions.append(existing_tx)
            continue

        # Bloque asociado
        block_id = None
        block_hash = tx_data.get("block_hash")
        if block_hash:
            try:
                bloque = await fetch_and_save_bloque(block_hash)
                if bloque:
                    block_id = bloque.id
            except Exception as e:
                print(f"⚠️ Error guardando bloque {block_hash[:8]}: {e}")

        # Inputs
        input_ids = []
        for vin in tx_data.get("inputs", []):
            for addr in vin.get("addresses", []):
                if addr:
                    try:
                        direccion = await fetch_and_save_direccion(addr)
                        input_ids.append(direccion.id)
                    except Exception as e:
                        print(f"⚠️ Error guardando dirección input {addr[:8]}: {e}")

        # Outputs
        output_ids = []
        for vout in tx_data.get("outputs", []):
            for addr in vout.get("addresses", []):
                if addr:
                    try:
                        direccion = await fetch_and_save_direccion(addr)
                        output_ids.append(direccion.id)
                    except Exception as e:
                        print(f"⚠️ Error guardando dirección output {addr[:8]}: {e}")

        # Fecha
        fecha_str = tx_data.get("confirmed")
        fecha_obj = datetime.fromisoformat(fecha_str.replace("Z", "+00:00")) if fecha_str else datetime.now()

        # Crear documento de transacción
        transaccion_doc = {
            "hash": tx_hash,
            "fecha": fecha_obj,
            "inputs": input_ids,
            "outputs": output_ids,
            "monto_total": float(tx_data.get("total", 0)) / 100_000_000,
            "estado": "confirmada" if tx_data.get("block_height", -1) > 0 else "pendiente",
            "patrones_sospechosos": [],
            "bloque": block_id,
            "fees": float(tx_data.get("fees", 0)) / 100_000_000,
            "confirmations": int(tx_data.get("confirmations", 0)),
        }

        try:
            result = await transaccion_collection.insert_one(transaccion_doc)
            created = await transaccion_collection.find_one({"_id": result.inserted_id})
            if created:
                saved_transactions.append(TransaccionModel(**created))
        except Exception as e:
            print(f"⚠️ Error guardando TX {tx_hash[:8]}: {e}")

    print(f"💾 Guardadas {len(saved_transactions)} transacciones para {address[:8]}...")
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