from typing import List, Optional
from app.database import transaccion_collection, PyObjectId
from app.models.transaccion import TransaccionModel
from app.schemas.transaccion import TransaccionCreateSchema
from app.services.direccion import fetch_and_save_direccion

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