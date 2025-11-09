from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.database import db
from app.schemas.alerta import AlertaCreate, AlertaResponse
from app.services.alerta import (
    crear_alerta,
    listar_alertas,
    get_alerta_by_id,
    delete_alerta,
    generar_alerta_por_riesgo
)

router = APIRouter(prefix="/alertas", tags=["alertas"])


# ✅ Manejo explícito del preflight CORS
@router.options("/", include_in_schema=False)
@router.options("/{path:path}", include_in_schema=False)
async def options_handler(request: Request):
    """
    Responde correctamente las peticiones OPTIONS (preflight CORS)
    """
    return {"allow": "GET, POST, DELETE, OPTIONS"}


# 🟢 Crear una nueva alerta (sin permisos)
@router.post("/", response_model=AlertaResponse)
async def create_alerta_endpoint(alerta: AlertaCreate):
    """Crear una nueva alerta manualmente"""
    try:
        created = await crear_alerta(db, alerta.model_dump())
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear alerta: {e}")


# 🟢 Listar todas las alertas (sin permisos)
@router.get("/", response_model=List[AlertaResponse])
async def list_alertas():
    """Listar todas las alertas"""
    try:
        alertas = await listar_alertas(db)
        return [a for a in alertas]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar alertas: {e}")


# 🟢 Obtener una alerta por ID (sin permisos)
@router.get("/{alerta_id}", response_model=AlertaResponse)
async def get_alerta(alerta_id: str):
    """Obtener una alerta por ID"""
    try:
        alerta = await get_alerta_by_id(db, alerta_id)
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta no encontrada")
        return alerta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener alerta: {e}")


# 🟢 Eliminar una alerta (sin permisos)
@router.delete("/{alerta_id}")
async def delete_alerta_endpoint(alerta_id: str):
    """Eliminar una alerta"""
    try:
        deleted = await delete_alerta(db, alerta_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Alerta no encontrada")
        return {"detail": "Alerta eliminada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar alerta: {e}")


# 🟢 Generar alerta automáticamente (sin permisos)
@router.post("/generar")
async def generar_alerta_endpoint(direccion_id: str, nivel_riesgo: str):
    """
    Generar una alerta automáticamente según el nivel de riesgo de la dirección.
    Ejemplo:
      POST /alertas/generar?direccion_id=123abc&nivel_riesgo=Crítico
    """
    try:
        await generar_alerta_por_riesgo(db, direccion_id, nivel_riesgo)
        return {
            "detail": f"Alerta generada para dirección {direccion_id} con nivel {nivel_riesgo}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar alerta: {e}")
