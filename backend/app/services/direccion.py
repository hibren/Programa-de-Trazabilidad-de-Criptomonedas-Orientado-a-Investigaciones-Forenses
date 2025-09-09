# app/services/direccion.py
from app.database import direccion_collection, PyObjectId
from typing import List, Optional

# -----------------------------
# Helper function: mapea _id -> id
# -----------------------------
def map_direccion(doc: dict) -> dict:
    """Convierte _id a id para que coincida con Pydantic"""
    if doc is None:
        return None
    
    print(f"🔄 MAPPING - Input doc: {doc}")
    
    result = {
        "id": str(doc["_id"]),  # <- ahora 'id', no '_id'
        "direccion": doc["direccion"],
        "balance": doc["balance"],
        "total_recibido": doc["total_recibido"],
        "total_enviado": doc["total_enviado"],
        "perfil_riesgo": doc["perfil_riesgo"]
    }
    
    print(f"✅ MAPPING - Output: {result}")
    return result

# -----------------------------
# Operaciones CRUD
# -----------------------------
async def get_all_direcciones() -> List[dict]:
    print("🚀 === INICIANDO get_all_direcciones ===")
    
    direcciones = []
    cursor = direccion_collection.find()
    
    async for doc in cursor:
        mapped_doc = map_direccion(doc)
        if mapped_doc:
            direcciones.append(mapped_doc)
    
    print(f"📋 Final result: {direcciones}")
    print(f"📋 Final count: {len(direcciones)}")
    print("🏁 === FINALIZANDO get_all_direcciones ===")
    
    return direcciones


async def create_direccion(data: dict) -> dict:
    print(f"🔨 Creating direccion with data: {data}")
    result = await direccion_collection.insert_one(data)
    created = await direccion_collection.find_one({"_id": result.inserted_id})
    mapped = map_direccion(created)
    print(f"✅ Created and mapped: {mapped}")
    return mapped


async def get_direccion_by_id(direccion_id: str) -> Optional[dict]:
    print(f"🔍 Getting direccion by id: {direccion_id}")
    try:
        doc = await direccion_collection.find_one({"_id": PyObjectId(direccion_id)})
        return map_direccion(doc)
    except Exception as e:
        print(f"❌ Error getting direccion by id: {e}")
        return None


async def update_direccion(direccion_id: str, data: dict) -> Optional[dict]:
    print(f"🔄 Updating direccion {direccion_id} with data: {data}")
    try:
        result = await direccion_collection.update_one(
            {"_id": PyObjectId(direccion_id)}, {"$set": data}
        )
        if result.modified_count:
            updated = await direccion_collection.find_one({"_id": PyObjectId(direccion_id)})
            return map_direccion(updated)
        return None
    except Exception as e:
        print(f"❌ Error updating direccion: {e}")
        return None


async def delete_direccion(direccion_id: str) -> int:
    print(f"🗑️ Deleting direccion: {direccion_id}")
    try:
        result = await direccion_collection.delete_one({"_id": PyObjectId(direccion_id)})
        return result.deleted_count
    except Exception as e:
        print(f"❌ Error deleting direccion: {e}")
        return 0
