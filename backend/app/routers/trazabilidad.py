from fastapi import APIRouter
from app.services.trazabilidad import obtener_trazas_por_direccion

router = APIRouter(prefix="/trazabilidad", tags=["Trazabilidad"])

@router.get("/trazas/{direccion}")
async def get_trazas(direccion: str, saltos: int = 3):
    """
    Endpoint que devuelve las transacciones asociadas a una dirección,
    mostrando los flujos detectados desde origen a destino.
    """
    return await obtener_trazas_por_direccion(direccion, saltos)
