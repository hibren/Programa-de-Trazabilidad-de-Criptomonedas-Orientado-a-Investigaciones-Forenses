from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.services.rastreo import (
    rastrear_origen,
    rastrear_destino,
    listar_rastreos
)
from app.schemas.rastreo import RastreoOut

router = APIRouter(prefix="/rastreo", tags=["rastreo"])


@router.get("/", response_model=List[RastreoOut])
async def get_rastreos():
    """
    Lista todos los rastreos registrados en la base de datos.
    """
    return await listar_rastreos()


@router.post("/origen", response_model=RastreoOut)
async def rastrear_origen_endpoint(
    direccion: str = Query(..., description="Dirección destino a rastrear hacia atrás"),
    profundidad: int = Query(3, ge=1, le=10, description="Cantidad de saltos hacia atrás")
):
    """
    Ejecuta un rastreo de origen, buscando hacia atrás en la blockchain
    para identificar el origen de los fondos. 
    Utiliza datos locales y, si no existen, consulta la API externa.
    """
    try:
        resultado = await rastrear_origen(direccion, profundidad)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/destino", response_model=RastreoOut)
async def rastrear_destino_endpoint(
    direccion: str = Query(..., description="Dirección origen a rastrear hacia adelante"),
    profundidad: int = Query(3, ge=1, le=10, description="Cantidad de saltos hacia adelante")
):
    """
    Ejecuta un rastreo de destino, analizando hacia dónde se dirigen los fondos
    desde una dirección origen. Usa datos locales o los obtiene de la API externa.
    """
    try:
        resultado = await rastrear_destino(direccion, profundidad)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
