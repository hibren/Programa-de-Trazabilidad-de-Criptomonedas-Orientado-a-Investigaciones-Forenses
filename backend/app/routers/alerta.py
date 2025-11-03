from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.services.alerta import get_all_alertas
from app.schemas.alerta import AlertaResponseSchema
from app.security import check_permissions_auto
from app.models.usuario import Usuario

router = APIRouter(prefix="/alertas", tags=["Alertas"])

@router.get("/", response_model=List[AlertaResponseSchema])
async def list_alertas(current_user: Usuario = Depends(check_permissions_auto)):
    try:
        alertas = await get_all_alertas()
        return [a.model_dump(by_alias=True) for a in alertas]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
