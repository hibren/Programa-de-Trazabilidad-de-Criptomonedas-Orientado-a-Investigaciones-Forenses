from fastapi import APIRouter
from app.services.trazabilidad import obtener_trazas_por_direccion, obtener_todas_las_trazas
from app.schemas.trazabilidad import TrazabilidadListOut

router = APIRouter(prefix="/trazabilidad", tags=["Trazabilidad"])
@router.get("/trazas", response_model=TrazabilidadListOut)
async def listar_todas_las_trazas(limit: int = 50):
    return await obtener_todas_las_trazas(limit)

@router.get("/trazas/{direccion}")
async def get_trazas(direccion: str, saltos: int = 3):
    """
    Endpoint que devuelve las transacciones asociadas a una dirección,
    mostrando los flujos detectados desde origen a destino.
    """
    return await obtener_trazas_por_direccion(direccion, saltos)
