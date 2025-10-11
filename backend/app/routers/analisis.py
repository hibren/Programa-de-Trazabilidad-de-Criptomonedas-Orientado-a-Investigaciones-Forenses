from fastapi import APIRouter, HTTPException
from app.schemas.analisis import (
    AnalisisOut,
    AnalisisRiesgoIn,
    AnalisisRiesgoOut
)
from app.services.analisis import (
    generar_analisis_por_direccion,
    get_all_analisis,
    analizar_riesgo_direcciones
)

router = APIRouter(prefix="/analisis", tags=["analisis"])


@router.get("/")
async def list_analisis():
    analisis = await get_all_analisis()
    return analisis



@router.post("/generar/{address}", response_model=AnalisisOut)
async def generar(address: str):
    analisis = await generar_analisis_por_direccion(address)
    if not analisis:
        raise HTTPException(status_code=404, detail="No se pudo generar el análisis")
    return analisis.dict(by_alias=True)



@router.post(
    "/riesgo",
    response_model=AnalisisRiesgoOut,
    summary="Analizar riesgo de direcciones (ChainAbuse + actividad blockchain)"
)
async def analizar_riesgo_endpoint(data: AnalisisRiesgoIn):
    try:
        result = await analizar_riesgo_direcciones(data.direccion)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
