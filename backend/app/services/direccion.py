from app.database import direccion_collection, PyObjectId
from app.models.direccion import DireccionModel
from app.schemas.direccion import DireccionCreateSchema
from typing import List, Optional
import httpx  # para llamar a la API externa

TOKEN = "be3c331ca2554fea8612129f72e1e5b9"
BASE_URL = "https://api.blockcypher.com/v1/btc/main"

# Obtener todos
async def get_all_direcciones():
    docs = await direccion_collection.find().to_list(100)
    return [DireccionModel(**doc).dict(by_alias=True) for doc in docs]

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
    url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            try:
                data = response.json()
            except ValueError:
                raise ValueError("La respuesta de la API no es JSON válido")
            
            if "error" in data:
                raise ValueError(data["error"])  # API devolvió error
        except httpx.HTTPStatusError as e:
            raise Exception(f"Error HTTP: {e.response.text}") from e
        except httpx.RequestError as e:
            raise Exception(f"Error de conexión con la API: {str(e)}") from e

    # Solo guardamos si no hubo error
    doc = {
        "direccion": address,
        "balance": float(data.get("balance", 0)),
        "total_recibido": float(data.get("total_received", 0)),
        "total_enviado": float(data.get("total_sent", 0)),
        "perfil_riesgo": "bajo",
    }

    existing = await direccion_collection.find_one({"direccion": address})
    if existing:
        await direccion_collection.update_one({"direccion": address}, {"$set": doc})
        doc["_id"] = existing["_id"]
    else:
        result = await direccion_collection.insert_one(doc)
        doc["_id"] = result.inserted_id

    return DireccionModel(**doc)
