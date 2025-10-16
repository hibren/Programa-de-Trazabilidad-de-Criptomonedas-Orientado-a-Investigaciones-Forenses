from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.usuario import Token, UsuarioCreate, LoginRequest, UsuarioResponseSchema, UsuarioUpdatePerfilSchema, UsuarioUpdate
from app.services import usuario as user_service
from app.models.usuario import Usuario
from app.models.perfil import Perfil
from app.security import get_current_user, check_permissions_auto
from app.database import db
from bson import ObjectId

router = APIRouter(
    prefix="/administracion/usuarios",
    tags=["usuarios"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=Token)
async def login_for_access_token(credentials: LoginRequest):
    return await user_service.login_user(credentials)

@router.get("/me/perfil", response_model=Perfil)
async def get_my_perfil(current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene el perfil del usuario actualmente autenticado.
    """
    perfil_doc = await db.perfiles.find_one({"_id": ObjectId(current_user.perfil)})
    if not perfil_doc:
        raise HTTPException(status_code=404, detail="Perfil de usuario no encontrado")
    return Perfil(**perfil_doc)

@router.get("/me", response_model=UsuarioResponseSchema)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene los datos del usuario actualmente autenticado.
    """
    return current_user

@router.get("/", response_model=List[UsuarioResponseSchema], dependencies=[Depends(check_permissions_auto)])
async def list_users():
    """
    Obtiene una lista de todos los usuarios.
    Requiere permisos de administrador.
    """
    users = await user_service.get_all_users()
    return users

@router.post("/", response_model=UsuarioResponseSchema, status_code=status.HTTP_201_CREATED, dependencies=[Depends(check_permissions_auto)])
async def create_new_user(user: UsuarioCreate):
    """
    Crea un nuevo usuario.
    Requiere permisos de administrador.
    """
    return await user_service.create_user(user)

@router.put("/{user_id}/asignar-perfil", response_model=UsuarioResponseSchema, dependencies=[Depends(check_permissions_auto)])
async def assign_perfil(user_id: str, perfil_update: UsuarioUpdatePerfilSchema):
    """
    Asigna un perfil a un usuario.
    Requiere permisos de administrador.
    """
    updated_user = await user_service.assign_perfil_to_user(user_id, perfil_update.perfil_id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="No se pudo actualizar el perfil del usuario.")
    return updated_user

@router.put("/{user_id}", response_model=UsuarioResponseSchema, dependencies=[Depends(check_permissions_auto)])
async def update_user_data(user_id: str, user_update: UsuarioUpdate):
    """
    Actualiza los datos de un usuario.
    Requiere permisos de administrador.
    """
    updated_user = await user_service.update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="No se pudo actualizar el usuario.")
    return updated_user

@router.patch("/{user_id}/toggle-active", response_model=UsuarioResponseSchema, dependencies=[Depends(check_permissions_auto)])
async def toggle_active(user_id: str):
    """
    Activa o desactiva un usuario.
    Requiere permisos de administrador.
    """
    updated_user = await user_service.toggle_user_active_status(user_id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="No se pudo cambiar el estado del usuario.")
    return updated_user