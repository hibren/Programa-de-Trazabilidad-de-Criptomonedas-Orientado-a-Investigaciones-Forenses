from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.relacion import RelacionOut
from app.services.relacion import get_all_relaciones, detectar_relaciones, get_relaciones_by_direccion
from app.security import check_permissions_auto
from app.models.usuario import Usuario

router = APIRouter(prefix="/relaciones", tags=["Relaciones"])

@router.get("/", response_model=List[RelacionOut])
async def list_relaciones(current_user: Usuario = Depends(check_permissions_auto)):
    """Listar relaciones existentes (limit 200 por defecto)."""
    try:
        return await get_all_relaciones()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detectar")
async def post_detectar_relaciones(current_user: Usuario = Depends(check_permissions_auto)):
    """Ejecutar la detección de vínculos entre direcciones."""
    try:
        result = await detectar_relaciones()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-direccion/{direccion}", response_model=List[RelacionOut])
async def get_relaciones_direccion(direccion: str, current_user: Usuario = Depends(check_permissions_auto)):
    """Obtener todas las relaciones en las que participa una dirección."""
    try:
        return await get_relaciones_by_direccion(direccion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
