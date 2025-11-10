from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from app.database import reporte_programado_collection
from app.models.reporte_programado import ReporteProgramado
from app.schemas.reporte_programado import (
    ReporteProgramadoCreate,
    ReporteProgramadoUpdate,
    ReporteProgramadoResponse,
)


# ================================================================
# 🔧 FUNCIÓN AUXILIAR
# ================================================================
def calcular_proxima_ejecucion(fecha_inicio: datetime, frecuencia: str) -> datetime:
    """Calcula la próxima ejecución basada en la frecuencia."""
    ahora = datetime.now()

    if ahora < fecha_inicio:
        return fecha_inicio

    if frecuencia == "diario":
        return ahora + timedelta(days=1)
    elif frecuencia == "semanal":
        return ahora + timedelta(weeks=1)
    elif frecuencia == "mensual":
        # Aproximadamente 30 días
        return ahora + timedelta(days=30)

    return fecha_inicio


# ================================================================
# 🟢 CREAR REPORTE PROGRAMADO
# ================================================================
async def crear_reporte_programado(data: ReporteProgramadoCreate) -> ReporteProgramado:
    """Crea un nuevo reporte programado."""

    # Validaciones específicas según tipo
    if data.tipo == "riesgo" and not data.direccion_hash:
        raise ValueError("Los reportes de riesgo requieren una dirección asociada.")

    if data.tipo == "actividad":
        if not data.fecha_inicio_periodo or not data.fecha_fin_periodo:
            raise ValueError("Los reportes de actividad requieren un rango de fechas.")

    # Calcular próxima ejecución
    proxima_ejecucion = calcular_proxima_ejecucion(data.fecha_inicio, data.frecuencia)

    # Preparar documento para MongoDB
    documento = {
        "nombre": data.nombre,
        "tipo": data.tipo,
        "formato": data.formato,
        "frecuencia": data.frecuencia,
        "fecha_inicio": data.fecha_inicio,
        "activo": data.activo,
        "direccion_hash": data.direccion_hash,
        "fecha_inicio_periodo": data.fecha_inicio_periodo,
        "fecha_fin_periodo": data.fecha_fin_periodo,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now(),
        "ultima_ejecucion": None,
        "proxima_ejecucion": proxima_ejecucion,
        "total_ejecuciones": 0,
    }

    # Insertar en la base de datos
    result = await reporte_programado_collection.insert_one(documento)
    created = await reporte_programado_collection.find_one({"_id": result.inserted_id})

    if not created:
        raise Exception("Error al crear el reporte programado.")

    return ReporteProgramado(**created)


# ================================================================
# 🟡 LISTAR TODOS LOS REPORTES
# ================================================================
async def obtener_todos_reportes_programados() -> List[ReporteProgramado]:
    """Obtiene todos los reportes programados."""
    cursor = reporte_programado_collection.find()
    reportes = await cursor.to_list(length=1000)
    return [ReporteProgramado(**r) for r in reportes]


# ================================================================
# 🔵 OBTENER POR ID
# ================================================================
async def obtener_reporte_programado_por_id(reporte_id: str) -> Optional[ReporteProgramado]:
    """Obtiene un reporte programado por su ID."""
    if not ObjectId.is_valid(reporte_id):
        return None

    reporte = await reporte_programado_collection.find_one({"_id": ObjectId(reporte_id)})
    if not reporte:
        return None

    return ReporteProgramado(**reporte)


# ================================================================
# 🟠 ACTUALIZAR REPORTE PROGRAMADO
# ================================================================
async def actualizar_reporte_programado(
    reporte_id: str,
    data: ReporteProgramadoUpdate
) -> Optional[ReporteProgramado]:
    """Actualiza un reporte programado existente."""
    if not ObjectId.is_valid(reporte_id):
        return None

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}

    if not update_data:
        return await obtener_reporte_programado_por_id(reporte_id)

    update_data["updatedAt"] = datetime.now()

    # Si cambia frecuencia o fecha_inicio, recalcular próxima ejecución
    if "frecuencia" in update_data or "fecha_inicio" in update_data:
        reporte_actual = await obtener_reporte_programado_por_id(reporte_id)
        if reporte_actual:
            nueva_fecha = update_data.get("fecha_inicio", reporte_actual.fecha_inicio)
            nueva_frecuencia = update_data.get("frecuencia", reporte_actual.frecuencia)
            update_data["proxima_ejecucion"] = calcular_proxima_ejecucion(
                nueva_fecha, nueva_frecuencia
            )

    await reporte_programado_collection.update_one(
        {"_id": ObjectId(reporte_id)},
        {"$set": update_data}
    )

    return await obtener_reporte_programado_por_id(reporte_id)


# ================================================================
# 🔴 ELIMINAR REPORTE PROGRAMADO
# ================================================================
async def eliminar_reporte_programado(reporte_id: str) -> bool:
    """Elimina un reporte programado."""
    if not ObjectId.is_valid(reporte_id):
        return False

    result = await reporte_programado_collection.delete_one({"_id": ObjectId(reporte_id)})
    return result.deleted_count > 0


# ================================================================
# ⚪ ACTIVAR / DESACTIVAR REPORTE
# ================================================================
async def activar_desactivar_reporte(reporte_id: str, activo: bool) -> Optional[ReporteProgramado]:
    """Activa o desactiva un reporte programado."""
    if not ObjectId.is_valid(reporte_id):
        return None

    await reporte_programado_collection.update_one(
        {"_id": ObjectId(reporte_id)},
        {"$set": {"activo": activo, "updatedAt": datetime.now()}}
    )

    return await obtener_reporte_programado_por_id(reporte_id)


# ================================================================
# 🕓 REPORTES PENDIENTES (para scheduler)
# ================================================================
async def obtener_reportes_pendientes() -> List[ReporteProgramado]:
    """Obtiene reportes activos cuya ejecución está pendiente."""
    ahora = datetime.now()

    cursor = reporte_programado_collection.find({
        "activo": True,
        "proxima_ejecucion": {"$lte": ahora}
    })

    reportes = await cursor.to_list(length=1000)
    return [ReporteProgramado(**r) for r in reportes]


# ================================================================
# 📊 REGISTRAR EJECUCIÓN
# ================================================================
async def registrar_ejecucion_reporte(reporte_id: str):
    """Registra que un reporte fue ejecutado y actualiza los campos de control."""
    if not ObjectId.is_valid(reporte_id):
        return

    reporte = await obtener_reporte_programado_por_id(reporte_id)
    if not reporte:
        return

    ahora = datetime.now()
    proxima = calcular_proxima_ejecucion(ahora, reporte.frecuencia)

    await reporte_programado_collection.update_one(
        {"_id": ObjectId(reporte_id)},
        {
            "$set": {
                "ultima_ejecucion": ahora,
                "proxima_ejecucion": proxima,
                "updatedAt": ahora,
            },
            "$inc": {"total_ejecuciones": 1},
        },
    )
