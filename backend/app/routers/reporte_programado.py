from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.reporte_programado import (
    ReporteProgramadoCreate,
    ReporteProgramadoUpdate,
    ReporteProgramadoResponse
)
from app.services.reporte_programado import (
    crear_reporte_programado,
    obtener_todos_reportes_programados,
    obtener_reporte_programado_por_id,
    actualizar_reporte_programado,
    eliminar_reporte_programado,
    activar_desactivar_reporte,
)

router = APIRouter(prefix="/reportes-programados", tags=["reportes-programados"])


# ================================================================
# 🟢 CREAR REPORTE PROGRAMADO
# ================================================================
@router.post(
    "/",
    response_model=ReporteProgramadoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear reporte programado"
)
async def crear_reporte(data: ReporteProgramadoCreate):
    """
    Crea un nuevo reporte programado.

    - **nombre**: Nombre descriptivo del reporte
    - **tipo**: riesgo, actividad o clusters
    - **formato**: PDF o CSV
    - **frecuencia**: diario, semanal o mensual
    - **fecha_inicio**: Fecha y hora de inicio
    - **activo**: Estado inicial (default: true)
    """
    try:
        reporte = await crear_reporte_programado(data)
        return reporte.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear reporte: {str(e)}")


# ================================================================
# 🟡 LISTAR TODOS LOS REPORTES
# ================================================================
@router.get(
    "/",
    response_model=List[ReporteProgramadoResponse],
    summary="Listar reportes programados"
)
async def listar_reportes():
    """Obtiene todos los reportes programados del sistema"""
    reportes = await obtener_todos_reportes_programados()
    return [r.model_dump() for r in reportes]


# ================================================================
# 🔵 OBTENER REPORTE POR ID
# ================================================================
@router.get(
    "/{reporte_id}",
    response_model=ReporteProgramadoResponse,
    summary="Obtener reporte por ID"
)
async def obtener_reporte(reporte_id: str):
    """Obtiene un reporte programado específico por su ID"""
    reporte = await obtener_reporte_programado_por_id(reporte_id)

    if not reporte:
        raise HTTPException(
            status_code=404,
            detail=f"Reporte programado con ID {reporte_id} no encontrado"
        )

    return reporte.model_dump()


# ================================================================
# 🟠 ACTUALIZAR REPORTE PROGRAMADO
# ================================================================
@router.put(
    "/{reporte_id}",
    response_model=ReporteProgramadoResponse,
    summary="Actualizar reporte programado"
)
async def actualizar_reporte(reporte_id: str, data: ReporteProgramadoUpdate):
    """Actualiza los campos de un reporte programado"""
    reporte = await actualizar_reporte_programado(reporte_id, data)

    if not reporte:
        raise HTTPException(
            status_code=404,
            detail=f"Reporte programado con ID {reporte_id} no encontrado"
        )

    return reporte.model_dump()


# ================================================================
# 🔴 ELIMINAR REPORTE PROGRAMADO
# ================================================================
@router.delete(
    "/{reporte_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar reporte programado"
)
async def eliminar_reporte(reporte_id: str):
    """Elimina un reporte programado del sistema"""
    eliminado = await eliminar_reporte_programado(reporte_id)

    if not eliminado:
        raise HTTPException(
            status_code=404,
            detail=f"Reporte programado con ID {reporte_id} no encontrado"
        )

    return None


# ================================================================
# ⚪ ACTIVAR / DESACTIVAR REPORTE
# ================================================================
@router.patch(
    "/{reporte_id}/toggle",
    response_model=ReporteProgramadoResponse,
    summary="Activar/Desactivar reporte"
)
async def toggle_reporte(reporte_id: str, activo: bool):
    """Activa o desactiva un reporte programado"""
    reporte = await activar_desactivar_reporte(reporte_id, activo)

    if not reporte:
        raise HTTPException(
            status_code=404,
            detail=f"Reporte programado con ID {reporte_id} no encontrado"
        )

    return reporte.model_dump()
