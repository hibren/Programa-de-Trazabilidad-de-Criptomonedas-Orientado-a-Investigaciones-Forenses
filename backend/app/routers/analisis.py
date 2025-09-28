from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.analisis import AnalisisOut
from app.services.analisis import generar_analisis, get_all_analisis

router = APIRouter(prefix="/analisis", tags=["analisis"])

@router.get("/", response_model=List[AnalisisOut])
async def list_analisis():
    analisis = await get_all_analisis()
    return [a.dict(by_alias=True) for a in analisis]

@router.post("/generar/{cluster_id}", response_model=AnalisisOut)
async def generar(cluster_id: str):
    analisis = await generar_analisis(cluster_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Cluster no encontrado")
    return analisis.dict(by_alias=True)
