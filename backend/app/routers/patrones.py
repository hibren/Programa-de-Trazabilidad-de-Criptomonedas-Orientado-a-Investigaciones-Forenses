from fastapi import APIRouter, Depends, HTTPException
from app.services.patrones import detectar_patrones_sospechosos, get_analisis_por_patrones
from app.security import check_permissions_auto
from app.models.usuario import Usuario
from typing import List
from app.schemas.analisis import AnalisisOut

router = APIRouter(prefix="/patrones", tags=["Patrones"])

@router.post("/detectar")
async def detectar_patrones_endpoint():
    try:
        resultados = await detectar_patrones_sospechosos()
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[AnalisisOut])
async def get_patrones_analizados():
    try:
        analisis = await get_analisis_por_patrones()
        return [a.model_dump(by_alias=True) for a in analisis]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
