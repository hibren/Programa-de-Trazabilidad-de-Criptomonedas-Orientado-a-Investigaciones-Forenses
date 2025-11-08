from fastapi import APIRouter, HTTPException, Depends
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
from app.security import check_permissions_auto
from app.models.usuario import Usuario
import os

router = APIRouter(prefix="/reportes", tags=["reportes"])

# 📄 Obtener todos los reportes guardados
@router.get("/", response_model=List[ReporteSchema])
async def list_reportes(current_user: Usuario = Depends(check_permissions_auto)):
    try:
        reportes = await get_all_reportes()
        return [report.model_dump() for report in reportes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔍 Buscar reportes por dirección
@router.post("/fetch/{direccion_hash}", response_model=List[ReporteSchema])
async def fetch_reportes(direccion_hash: str, current_user: Usuario = Depends(check_permissions_auto)):
    try:
        reportes = await fetch_reportes_by_address(direccion_hash)
        return [report.model_dump() for report in reportes]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 GENERACIÓN DE REPORTES
# =====================================================

@router.post("/generar/riesgo/{address}")
async def generar_riesgo(address: str, formato: str = "PDF"):
    try:
        path = await generar_reporte_riesgo(address, formato)
        return {"status": "ok", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/generar/actividad/")
async def generar_actividad(fecha_inicio: str, fecha_fin: str):
    try:
        path = await generar_reporte_actividad(fecha_inicio, fecha_fin)
        return {"status": "ok", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generar/clusters/")
async def generar_clusters():
    try:
        path = await generar_reporte_clusters()
        return {"status": "ok", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DESCARGA DE ARCHIVOS GENERADOS
# =====================================================

@router.get("/download/{filename}")
async def descargar_reporte(filename: str):
    file_path = os.path.join("app/static/reportes", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path, filename=filename)
