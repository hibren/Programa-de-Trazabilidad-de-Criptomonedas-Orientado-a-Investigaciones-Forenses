from app.database import bloque_collection, PyObjectId
from app.models.bloque import BloqueModel
from app.schemas.bloque import BloqueCreateSchema
from typing import List, Optional
import httpx
from datetime import datetime

TOKEN = "be3c331ca2554fea8612129f72e1e5b9"
BASE_URL = "https://api.blockcypher.com/v1/btc/main"

# Obtener todos
async def get_all_bloques():
    docs = await bloque_collection.find().to_list(100)
    return [BloqueModel(**doc).dict(by_alias=True) for doc in docs]

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
    url = f"https://api.blockcypher.com/v1/btc/main/blocks/{block_hash}"

    async with httpx.AsyncClient(timeout=10.0) as client:
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

    fecha_str = data.get("time")
    fecha_obj = datetime.fromisoformat(fecha_str.replace("Z", "+00:00"))
    
    doc = {
        "numero_bloque": data.get("height"),
        "hash": data.get("hash"),
        "fecha": fecha_obj.date(),
        "recompensa_total": float(data.get("fees", 0)) / 100000000,
        "volumen_total": float(data.get("total", 0)) / 100000000,
    }

    existing = await bloque_collection.find_one({"hash": block_hash})
    if existing:
        await bloque_collection.update_one({"hash": block_hash}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        result = await bloque_collection.insert_one(doc)
        doc["_id"] = result.inserted_id

    return BloqueModel(**doc)
