from fastapi import APIRouter, HTTPException
from app.schemas.patrones_temporales import PatronTemporalIn, PatronTemporalOut
from app.services.patrones_temporales import generar_patrones_temporales as generar_patrones_temporales_service

router = APIRouter(prefix="/patrones", tags=["patrones temporales"])

@router.post(
    "/temporales",
    response_model=PatronTemporalOut,
    summary="Detecta patrones de actividad temporal y guarda el resultado"
)
async def crear_patrones_temporales(data: PatronTemporalIn):
    try:
        patron = await generar_patrones_temporales_service(data.direcciones, data.ventana)
        return patron.dict(by_alias=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
