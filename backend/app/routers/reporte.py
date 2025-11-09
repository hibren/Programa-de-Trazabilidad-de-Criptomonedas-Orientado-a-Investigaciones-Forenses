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

router = APIRouter(prefix="/reportes", tags=["reportes"])

# 📄 Listar todos los reportes (requiere login si querés mantener seguridad)
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
async def generar_clusters():
    """Genera un reporte de clusters y redes (PDF) sin requerir autenticación."""
    path = await generar_reporte_clusters()

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
