from app.database import direccion_collection, PyObjectId
from app.models.direccion import DireccionModel
from app.schemas.direccion import DireccionCreateSchema
from typing import List, Optional
import httpx
import asyncio
import random
import json

BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"
BLOCKCYPHER_TOKENS = [
    "d210a6ac92274d61b1f15e2c3652bf57",
    "0da27d786bd94dbb89c7ca6d0274fc03",
]

def get_random_token():
    return random.choice(BLOCKCYPHER_TOKENS)

async def get_all_direcciones():
    docs = await direccion_collection.find().to_list(None)
    result = []
    for doc in docs:
        # convierte el ObjectId a string
        doc["_id"] = str(doc["_id"])
        # usa .dict(by_alias=True) para mantener los alias
        result.append(DireccionModel(**doc).dict(by_alias=True))
    return result

async def create_direccion(data: dict) -> dict:
    result = await direccion_collection.insert_one(data)
    created = await direccion_collection.find_one({"_id": result.inserted_id})
    return DireccionModel(**created).dict(by_alias=True)

# Obtener por dirección
async def get_direccion_by_value(direccion_str: str) -> Optional[DireccionModel]:
    doc = await direccion_collection.find_one({"direccion": direccion_str})
    return DireccionModel(**doc) if doc else None

# Actualizar
async def update_direccion(direccion_id: str, data: dict) -> Optional[DireccionModel]:
    await direccion_collection.update_one(
        {"_id": PyObjectId(direccion_id)}, {"$set": data}
    )
    updated = await direccion_collection.find_one({"_id": PyObjectId(direccion_id)})
    return DireccionModel(**updated) if updated else None

# Eliminar
async def delete_direccion(direccion_id: str) -> int:
    result = await direccion_collection.delete_one({"_id": PyObjectId(direccion_id)})
    return result.deleted_count

async def fetch_and_save_direccion(address: str) -> DireccionModel:
    MAX_INTENTOS = 3
    BASE_DELAY = 5  # segundos
    data = None

    for intento in range(MAX_INTENTOS):
        try:
            token = get_random_token()
            url = f"{BLOCKCYPHER_API}/addrs/{address}/full?token={token}"
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            }
            
            delay = random.uniform(2, 5)
            await asyncio.sleep(delay)
            
            print(f"🌐 [Dirección] Consultando {address[:8]}... (Intento {intento + 1})")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                
                content_type = response.headers.get("Content-Type", "")
                response_text = response.text
                
                if "Cloudflare" in response_text or "Just a moment" in response_text:
                    print(f"🔒 Cloudflare detectado en dirección {address[:8]}. Reintentando...")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                if "application/json" not in content_type:
                    print(f"⚠️ Respuesta no es JSON para dirección {address[:8]}: {content_type}")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                try:
                    api_data = response.json()
                except json.JSONDecodeError:
                    print(f"❌ JSON inválido para dirección {address[:8]}.")
                    await asyncio.sleep(BASE_DELAY * (intento + 1))
                    continue
                
                if "error" in api_data:
                    error_msg = api_data["error"]
                    if "limit" in error_msg.lower():
                        print(f"⏳ Rate limit en dirección {address[:8]}. Esperando...")
                        await asyncio.sleep(BASE_DELAY * 2)
                        continue
                    raise Exception(f"Error de API para {address}: {error_msg}")
                
                response.raise_for_status()
                data = api_data
                break # Salir del bucle si todo fue bien

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429: # Too Many Requests
                print(f"⏳ HTTP 429 en dirección {address[:8]}. Esperando...")
                await asyncio.sleep(BASE_DELAY * 3)
            else:
                raise Exception(f"Error HTTP para {address}: {e.response.text}") from e
        except httpx.RequestError as e:
            print(f"🔌 Error de conexión para {address}. Reintentando...")
            await asyncio.sleep(BASE_DELAY * (intento + 1))

    if not data:
        raise Exception(f"No se pudo obtener datos para la dirección {address} después de {MAX_INTENTOS} intentos.")

    txs = data.get("txs", [])
    primer_tx = None
    ultima_tx = None
    if txs:
        # Las transacciones vienen ordenadas por BlockCypher de más reciente a más antigua
        ultima_tx = txs[0].get("confirmed")
        primer_tx = txs[-1].get("confirmed")

    doc = {
        "direccion": address,
        "balance": float(data.get("balance", 0)),
        "unconfirmed_balance": float(data.get("unconfirmed_balance", 0)),
        "final_balance": float(data.get("final_balance", 0)),
        "total_recibido": float(data.get("total_received", 0)),
        "total_enviado": float(data.get("total_sent", 0)),
        "perfil_riesgo": "bajo",
        "n_tx": int(data.get("n_tx", 0)),
        "unconfirmed_n_tx": int(data.get("unconfirmed_n_tx", 0)),
        "final_n_tx": int(data.get("final_n_tx", 0)),
        "has_more": bool(data.get("hasMore", False)),
        "primer_tx": primer_tx,
        "ultima_tx": ultima_tx,
    }

    existing = await direccion_collection.find_one({"direccion": address})
    if existing:
        await direccion_collection.update_one({"direccion": address}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        result = await direccion_collection.insert_one(doc)
        doc["_id"] = result.inserted_id

    return DireccionModel(**doc)
