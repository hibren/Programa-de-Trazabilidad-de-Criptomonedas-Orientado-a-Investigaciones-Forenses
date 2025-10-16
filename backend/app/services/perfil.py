from bson import ObjectId
from typing import List, Optional
from app.database import db
from app.schemas.perfil import PerfilCreateSchema, PerfilUpdateSchema
from app.models.perfil import Perfil

perfiles_collection = db.get_collection("perfiles")

async def create_perfil(perfil_data: PerfilCreateSchema) -> Perfil:
    """
    Crea un nuevo perfil en la base de datos.
    """
    perfil_dict = perfil_data.model_dump(by_alias=True, exclude_unset=True)
    result = await perfiles_collection.insert_one(perfil_dict)
    new_perfil = await perfiles_collection.find_one({"_id": result.inserted_id})
    return Perfil(**new_perfil)

async def get_all_perfiles() -> List[Perfil]:
    """
    Obtiene todos los perfiles de la base de datos.
    """
    perfiles = []
    async for perfil in perfiles_collection.find():
        perfiles.append(Perfil(**perfil))
    return perfiles

async def get_perfil_by_id(perfil_id: str) -> Optional[Perfil]:
    """
    Obtiene un perfil por su ID.
    """
    perfil = await perfiles_collection.find_one({"_id": ObjectId(perfil_id)})
    if perfil:
        return Perfil(**perfil)
    return None

async def update_perfil(perfil_id: str, perfil_data: PerfilUpdateSchema) -> Optional[Perfil]:
    """
    Actualiza un perfil en la base de datos.
    """
    update_data = perfil_data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_perfil_by_id(perfil_id)

    result = await perfiles_collection.update_one(
        {"_id": ObjectId(perfil_id)},
        {"$set": update_data}
    )
    if result.modified_count > 0:
        updated_document = await perfiles_collection.find_one({"_id": ObjectId(perfil_id)})
        if updated_document:
            return Perfil(**updated_document)
    return None


async def delete_perfil(perfil_id: str) -> bool:
    """
    Elimina un perfil de la base de datos.
    """
    result = await perfiles_collection.delete_one({"_id": ObjectId(perfil_id)})
    return result.deleted_count > 0