from app.database import direccion_collection, PyObjectId
from app.models.direccion import DireccionModel
from app.schemas.direccion import DireccionCreateSchema
from typing import List, Optional

# Obtener todos
async def get_all_direcciones() -> List[DireccionModel]:
    direcciones = []
    cursor = direccion_collection.find()
    async for doc in cursor:
        direcciones.append(DireccionModel(**doc))
    return direcciones

# Crear
async def create_direccion(data: dict) -> DireccionModel:
    result = await direccion_collection.insert_one(data)
    created = await direccion_collection.find_one({"_id": result.inserted_id})
    return DireccionModel(**created)

# Obtener por id
async def get_direccion_by_id(direccion_id: str) -> Optional[DireccionModel]:
    doc = await direccion_collection.find_one({"_id": PyObjectId(direccion_id)})
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
