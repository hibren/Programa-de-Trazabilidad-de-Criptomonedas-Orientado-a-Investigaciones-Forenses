from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.analisis import AnalisisOut
from app.services.analisis import generar_analisis_por_direccion, get_all_analisis

router = APIRouter(prefix="/analisis", tags=["analisis"])

@router.get("/analisis/")
async def list_analisis():
    analisis = await get_all_analisis()
    return analisis

@router.post("/generar/{address}", response_model=AnalisisOut)
async def generar(address: str):
    analisis = await generar_analisis_por_direccion(address)
    if not analisis:
        raise HTTPException(status_code=404, detail="No se pudo generar el análisis")
    return analisis.dict(by_alias=True)
