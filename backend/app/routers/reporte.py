from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List
from app.schemas.reporte import Reporte as ReporteSchema
from app.services.reporte import (
    get_all_reportes,
    fetch_reportes_by_address,
    generar_reporte_riesgo,
    generar_reporte_actividad,
    generar_reporte_clusters,
)
import os
from datetime import datetime
from app.database import reporte_collection
from datetime import datetime, timedelta


router = APIRouter(prefix="/reportes", tags=["reportes"])

# 📄 Listar todos los reportes de ChainAbuse (requiere login si querés mantener seguridad)
@router.get("/", response_model=List[ReporteSchema])
async def list_reportes():
    reportes = await get_all_reportes()
    return [r.model_dump() for r in reportes]


# 🔍 Buscar reportes por dirección (público)
@router.post("/fetch/{direccion_hash}", response_model=List[ReporteSchema])
async def fetch_reportes(direccion_hash: str):
    reportes = await fetch_reportes_by_address(direccion_hash)
    return [r.model_dump() for r in reportes]


# =====================================================
# 🔹 HISTORIAL DE REPORTES GENERADOS
# =====================================================

@router.get("/historial")
async def obtener_historial():
    """
    Lee todos los archivos PDF/CSV generados en la carpeta static/reportes
    y devuelve la metadata para mostrar en el historial.
    """
    reportes_path = "app/static/reportes"
    
    # Validar que existe la carpeta
    if not os.path.exists(reportes_path):
        return []
    
    archivos = []
    
    # Leer todos los archivos
    for filename in os.listdir(reportes_path):
        filepath = os.path.join(reportes_path, filename)
        
        # Solo archivos (no carpetas)
        if not os.path.isfile(filepath):
            continue
        
        # Solo PDF y CSV
        extension = filename.split(".")[-1].lower()
        if extension not in ["pdf", "csv"]:
            continue
        
        # Obtener metadata del archivo
        stats = os.stat(filepath)
        
        # Formatear tamaño
        size_bytes = stats.st_size
        if size_bytes < 1024:
            peso = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            peso = f"{size_bytes / 1024:.1f} KB"
        else:
            peso = f"{size_bytes / (1024 * 1024):.1f} MB"
        
        # Fecha de modificación
        fecha_timestamp = stats.st_mtime
        fecha = datetime.fromtimestamp(fecha_timestamp).strftime("%Y-%m-%d %H:%M:%S")
        
        # Generar nombre legible desde el filename
        # Ejemplo: "riesgo_0x1234_20240115_143000.pdf" -> "Reporte De Riesgo - 0x1234"
        nombre_sin_ext = filename.rsplit(".", 1)[0]
        
        # Intentar parsear el tipo de reporte
        if nombre_sin_ext.startswith("riesgo_"):
            partes = nombre_sin_ext.split("_")
            if len(partes) >= 2:
                address_corta = partes[1][:12]
                nombre = f"Reporte de Riesgo - {address_corta}"
            else:
                nombre = "Reporte de Riesgo"
        elif nombre_sin_ext.startswith("actividad_"):
            partes = nombre_sin_ext.split("_")
            if len(partes) >= 3:
                fecha_inicio = partes[1]
                fecha_fin = partes[2]
                nombre = f"Actividad {fecha_inicio} a {fecha_fin}"
            else:
                nombre = "Reporte de Actividad"
        elif nombre_sin_ext.startswith("clusters_"):
            nombre = "Análisis de Clusters"
        else:
            # Fallback: capitalizar y reemplazar guiones bajos
            nombre = nombre_sin_ext.replace("_", " ").title()
        
        archivos.append({
            "nombre": nombre,
            "filename": filename,
            "formato": extension.upper(),
            "peso": peso,
            "fecha": fecha,
            "download_url": f"/reportes/download/{filename}"
        })
    
    # Ordenar por fecha (más recientes primero)
    archivos.sort(key=lambda x: x["fecha"], reverse=True)
    
    return archivos


# =====================================================
# 🔹 GENERACIÓN DE REPORTES (sin autenticación)
# =====================================================

@router.post("/generar/riesgo/{address}")
async def generar_riesgo(address: str, formato: str = "PDF", force_api: bool = False):
    """Genera un reporte de riesgo (PDF o CSV) sin requerir autenticación."""
    formato_upper = formato.upper()
    path = await generar_reporte_riesgo(address, formato_upper, force_api)

    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail="No se encontró el archivo generado")

    filename = os.path.basename(path)
    return {
        "status": "ok",
        "path": path,
        "filename": filename,
        "download_url": f"/reportes/download/{filename}",
    }


@router.post("/generar/actividad/")
async def generar_actividad(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...),
    formato: str = Query("PDF"),
):
    """Genera un reporte de actividad (PDF o CSV) sin requerir autenticación."""
    path = await generar_reporte_actividad(fecha_inicio, fecha_fin, formato)

    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail="Error al crear el archivo")

    filename = os.path.basename(path)
    return {
        "status": "ok",
        "path": path,
        "filename": filename,
        "download_url": f"/reportes/download/{filename}",
    }


@router.post("/generar/clusters/")
async def generar_clusters(formato: str = Query("PDF")):
    path = await generar_reporte_clusters(formato)
    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail="Error al crear el archivo")
    filename = os.path.basename(path)
    return {
        "status": "ok",
        "path": path,
        "filename": filename,
        "download_url": f"/reportes/download/{filename}",
    }


# =====================================================
# 🔹 DESCARGA DE ARCHIVOS GENERADOS
# =====================================================

@router.get("/download/{filename}")
async def descargar_reporte(filename: str):
    """Descarga cualquier reporte generado (PDF o CSV)."""
    file_path = os.path.join("app/static/reportes", filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        media_type = "application/pdf"
    elif ext == "csv":
        media_type = "text/csv"
    else:
        media_type = "application/octet-stream"

    return FileResponse(file_path, filename=filename, media_type=media_type)



@router.get("/stats")
async def obtener_estadisticas_reportes():
    """
    Devuelve estadísticas generales para el dashboard de reportes.
    Incluye cantidad total de reportes generados, exportaciones, programados, plantillas, etc.
    """

    # 1️⃣ Total de reportes generados
    total_reportes = await reporte_collection.count_documents({})

    # 2️⃣ Reportes generados en la última semana
    hace_7_dias = datetime.now() - timedelta(days=7)
    recientes = await reporte_collection.count_documents({"createdAt": {"$gte": hace_7_dias}})

    # 3️⃣ Exportaciones (archivos CSV generados)
    total_csv = await reporte_collection.count_documents({"formato": "CSV"})
    csv_hoy = await reporte_collection.count_documents({
        "formato": "CSV",
        "createdAt": {"$gte": datetime.now().replace(hour=0, minute=0, second=0)}
    })

    # 4️⃣ Reportes programados (placeholder, si más adelante los manejás con otra colección)
    total_programados = 0  # ⚙️ Podés actualizar esto cuando implementes reportes programados

    # 5️⃣ Plantillas disponibles (por ahora lo dejamos estático o cargado desde carpeta)
    total_plantillas = len([
        f for f in os.listdir("app/static/reportes")
        if f.startswith("plantilla_") and f.endswith(".pdf")
    ]) if os.path.exists("app/static/reportes") else 0

    # 📊 Preparar respuesta para frontend
    return [
        {
            "key": "generados",
            "title": "Reportes Generados",
            "value": total_reportes,
            "subtitle": f"+{recientes} esta semana" if recientes else "Sin nuevos reportes",
        },
        {
            "key": "exportaciones",
            "title": "Exportaciones",
            "value": total_csv,
            "subtitle": f"+{csv_hoy} hoy" if csv_hoy else "Sin nuevas exportaciones",
        },
        {
            "key": "programados",
            "title": "Programados",
            "value": total_programados,
            "subtitle": "Sin cambios",
        },
        {
            "key": "plantillas",
            "title": "Plantillas",
            "value": total_plantillas,
            "subtitle": "+2 nuevas" if total_plantillas > 0 else "Ninguna disponible",
        },
    ]