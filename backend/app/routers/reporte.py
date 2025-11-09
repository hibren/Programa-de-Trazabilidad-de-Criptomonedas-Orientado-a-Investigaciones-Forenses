from fastapi import APIRouter, HTTPException, Depends, Query
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
async def generar_riesgo(
    address: str, 
    formato: str = "PDF",
    force_api: bool = False
):
    """
    Genera un reporte de riesgo para una dirección específica.
    
    - **address**: Dirección de criptomoneda a analizar
    - **formato**: PDF (default), WORD o CSV
    - **force_api**: Si True, intenta consultar ChainAbuse (puede fallar por rate limit)
    
    Por defecto usa solo datos de BD para evitar rate limits.
    """
    try:
        print(f"\n{'='*60}")
        print(f"🔹 INICIO - Generando reporte de riesgo")
        print(f"   Address: {address}")
        print(f"   Formato: {formato}")
        print(f"   Force API: {force_api}")
        print(f"{'='*60}\n")
        
        # Validar formato
        formato_upper = formato.upper()
        if formato_upper not in ["PDF", "WORD", "CSV"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Formato '{formato}' no válido. Usa: PDF, WORD o CSV"
            )
        
        # Verificar que existe el directorio
        reportes_dir = "app/static/reportes"
        if not os.path.exists(reportes_dir):
            print(f"⚠️ Creando directorio: {reportes_dir}")
            os.makedirs(reportes_dir, exist_ok=True)
        
        print(f"📂 Directorio de reportes: {os.path.abspath(reportes_dir)}")
        print(f"🔧 Llamando a generar_reporte_riesgo()...")
        
        path = await generar_reporte_riesgo(address, formato_upper, force_api)
        
        print(f"✅ Función retornó path: {path}")
        
        # Verificar que el archivo se creó
        if not os.path.exists(path):
            print(f"❌ ERROR: El archivo NO existe en {path}")
            raise HTTPException(
                status_code=500, 
                detail=f"El archivo se generó pero no se encuentra en {path}"
            )
        
        file_size = os.path.getsize(path)
        filename = os.path.basename(path)
        
        print(f"✅ Archivo creado exitosamente:")
        print(f"   - Nombre: {filename}")
        print(f"   - Tamaño: {file_size} bytes")
        print(f"   - Path completo: {os.path.abspath(path)}")
        print(f"\n{'='*60}\n")
        
        return {
            "status": "ok", 
            "path": path,
            "filename": filename,
            "download_url": f"/reportes/download/{filename}",
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"\n{'='*60}")
        print(f"❌ ERROR CRÍTICO al generar reporte:")
        print(f"   Tipo: {type(e).__name__}")
        print(f"   Mensaje: {str(e)}")
        print(f"\n📋 TRACEBACK COMPLETO:")
        print(error_trace)
        print(f"{'='*60}\n")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar reporte: {type(e).__name__}: {str(e)}"
        )


@router.post("/generar/actividad/")
async def generar_actividad(
    fecha_inicio: str, 
    fecha_fin: str,
    current_user: Usuario = Depends(check_permissions_auto)
):
    """
    Genera un reporte de actividad por período.
    
    - **fecha_inicio**: Fecha inicial (formato: YYYY-MM-DD)
    - **fecha_fin**: Fecha final (formato: YYYY-MM-DD)
    """
    try:
        print(f"🔹 Generando reporte de actividad: {fecha_inicio} a {fecha_fin}")
        path = await generar_reporte_actividad(fecha_inicio, fecha_fin)
        
        if not os.path.exists(path):
            raise HTTPException(status_code=500, detail="Error al crear el archivo")
        
        filename = os.path.basename(path)
        print(f"✅ Reporte de actividad generado: {filename}")
        
        return {
            "status": "ok", 
            "path": path,
            "filename": filename,
            "download_url": f"/reportes/download/{filename}"
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generar/clusters/")
async def generar_clusters(current_user: Usuario = Depends(check_permissions_auto)):
    """
    Genera un reporte de análisis de clusters y redes.
    """
    try:
        print("🔹 Generando reporte de clusters")
        path = await generar_reporte_clusters()
        
        if not os.path.exists(path):
            raise HTTPException(status_code=500, detail="Error al crear el archivo")
        
        filename = os.path.basename(path)
        print(f"✅ Reporte de clusters generado: {filename}")
        
        return {
            "status": "ok", 
            "path": path,
            "filename": filename,
            "download_url": f"/reportes/download/{filename}"
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DESCARGA DE ARCHIVOS GENERADOS
# =====================================================

@router.get("/download/{filename}")
async def descargar_reporte(filename: str):
    """Descarga un reporte en formato PDF o CSV con el tipo MIME correcto."""
    file_path = os.path.join("app/static/reportes", filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Archivo '{filename}' no encontrado"
        )

    # Detectar extensión para devolver el MIME correcto
    ext = filename.split(".")[-1].lower()

    if ext == "pdf":
        media_type = "application/pdf"
    elif ext == "csv":
        media_type = "text/csv"
    else:
        media_type = "application/octet-stream"

    return FileResponse(
        file_path,
        filename=filename,
        media_type=media_type,
    )