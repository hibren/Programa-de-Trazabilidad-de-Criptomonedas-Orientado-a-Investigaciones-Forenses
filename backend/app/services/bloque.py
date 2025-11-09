from app.database import bloque_collection, PyObjectId
from app.models.bloque import BloqueModel
from app.schemas.bloque import BloqueCreateSchema
from typing import List, Optional
import httpx
from datetime import datetime
import asyncio
import random
import json

BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"
BLOCKCYPHER_TOKENS = [
    "d210a6ac92274d61b1f15e2c3652bf57",
    "0da27d786bd94dbb89c7ca6d0274fc03",
]

def get_random_token():
    """Rota entre múltiples tokens para evitar límites."""
    return random.choice(BLOCKCYPHER_TOKENS)

# Obtener todos
async def get_all_bloques():
    docs = await bloque_collection.find().to_list(1000)
    return [BloqueModel(**doc) for doc in docs]  # 👈 convierte cada doc en modelo

async def create_bloque(data: dict) -> dict:
    result = await bloque_collection.insert_one(data)
    created = await bloque_collection.find_one({"_id": result.inserted_id})
    return BloqueModel(**created).dict(by_alias=True)

# Obtener por hash
async def get_bloque_by_hash(bloque_hash: str) -> Optional[BloqueModel]:
    doc = await bloque_collection.find_one({"hash": bloque_hash})
    return BloqueModel(**doc) if doc else None

# Actualizar
async def update_bloque(bloque_id: str, data: dict) -> Optional[BloqueModel]:
    await bloque_collection.update_one(
        {"_id": PyObjectId(bloque_id)}, {"$set": data}
    )
    updated = await bloque_collection.find_one({"_id": PyObjectId(bloque_id)})
    return BloqueModel(**updated) if updated else None

# Eliminar
async def delete_bloque(bloque_id: str) -> int:
    result = await bloque_collection.delete_one({"_id": PyObjectId(bloque_id)})
    return result.deleted_count

async def fetch_and_save_bloque(block_hash: str) -> BloqueModel:
    MAX_INTENTOS = 3
    BASE_DELAY = 5  # segundos
    data = None

    for intento in range(MAX_INTENTOS):
        try:
            token = get_random_token()
            url = f"{BLOCKCYPHER_API}/blocks/{block_hash}?token={token}"
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            }
            
            delay = random.uniform(2, 5)
            await asyncio.sleep(delay)
            
            print(f"🌐 [Bloque] Consultando {block_hash[:8]}... (Intento {intento + 1})")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                
                content_type = response.headers.get("Content-Type", "")
                response_text = response.text
                
                if "Cloudflare" in response_text or "Just a moment" in response_text:
                    print(f"🔒 Cloudflare detectado en bloque {block_hash[:8]}. Reintentando...")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                if "application/json" not in content_type:
                    print(f"⚠️ Respuesta no es JSON para bloque {block_hash[:8]}: {content_type}")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                try:
                    api_data = response.json()
                except json.JSONDecodeError:
                    print(f"❌ JSON inválido para bloque {block_hash[:8]}.")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                if "error" in api_data:
                    error_msg = api_data["error"]
                    if "limit" in error_msg.lower():
                        print(f"⏳ Rate limit en bloque {block_hash[:8]}. Esperando...")
                        await asyncio.sleep(BASE_DELAY * 2)
                        continue
                    raise Exception(f"Error de API para bloque {block_hash}: {error_msg}")
                
                response.raise_for_status()
                data = api_data
                break # Salir del bucle si todo fue bien

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429: # Too Many Requests
                print(f"⏳ HTTP 429 en bloque {block_hash[:8]}. Esperando...")
                await asyncio.sleep(BASE_DELAY * 3)
            else:
                raise Exception(f"Error HTTP para bloque {block_hash}: {e.response.text}") from e
        except httpx.RequestError as e:
            print(f"🔌 Error de conexión para bloque {block_hash}. Reintentando...")
            await asyncio.sleep(BASE_DELAY * (intento + 1))

    if not data:
        raise Exception(f"No se pudo obtener datos para el bloque {block_hash} después de {MAX_INTENTOS} intentos.")

    fecha_str = data.get("time")
    if fecha_str:
        fecha_obj = datetime.fromisoformat(fecha_str.replace("Z", "+00:00"))
    else:
        # Si no hay fecha, usar la actual como fallback
        fecha_obj = datetime.now(datetime.timezone.utc)
    
    doc = {
        "numero_bloque": data.get("height"),
        "hash": data.get("hash"),
        "fecha": fecha_obj,
        "recompensa_total": float(data.get("fees", 0)) / 100_000_000,
        "volumen_total": float(data.get("total", 0)) / 100_000_000,
    }

    existing = await bloque_collection.find_one({"hash": block_hash})
    if existing:
        await bloque_collection.update_one({"hash": block_hash}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        result = await bloque_collection.insert_one(doc)
        doc["_id"] = result.inserted_id

    return BloqueModel(**doc)
