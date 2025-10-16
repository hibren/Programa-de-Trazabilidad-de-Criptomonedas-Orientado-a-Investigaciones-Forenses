from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.perfil import PerfilCreateSchema, PerfilUpdateSchema, PerfilResponseSchema
from app.services import perfil as perfil_service
from app.security import check_permissions_auto
from app.models.usuario import Usuario

router = APIRouter(
    prefix="/administracion/perfiles",
    tags=["perfiles"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(check_permissions_auto)]
)

@router.post("/", response_model=PerfilResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_new_perfil(perfil: PerfilCreateSchema):
    """
    Crea un nuevo perfil.
    """
    new_perfil = await perfil_service.create_perfil(perfil)
    return new_perfil

@router.get("/", response_model=List[PerfilResponseSchema])
async def get_all_perfiles():
    """
    Obtiene todos los perfiles.
    """
    perfiles = await perfil_service.get_all_perfiles()
    return perfiles

@router.get("/{perfil_id}", response_model=PerfilResponseSchema)
async def get_perfil(perfil_id: str):
    """
    Obtiene un perfil por su ID.
    """
    perfil = await perfil_service.get_perfil_by_id(perfil_id)
    if perfil:
        return perfil
    raise HTTPException(status_code=404, detail="Perfil no encontrado")

@router.put("/{perfil_id}", response_model=PerfilResponseSchema)
async def update_existing_perfil(perfil_id: str, perfil_data: PerfilUpdateSchema):
    """
    Actualiza un perfil existente.
    """
    updated_perfil = await perfil_service.update_perfil(perfil_id, perfil_data)
    if updated_perfil:
        return updated_perfil
    raise HTTPException(status_code=404, detail="Perfil no encontrado")

@router.delete("/{perfil_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_perfil(perfil_id: str):
    """
    Elimina un perfil.
    """
    deleted = await perfil_service.delete_perfil(perfil_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return