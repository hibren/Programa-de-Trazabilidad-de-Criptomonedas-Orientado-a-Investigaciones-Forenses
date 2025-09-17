from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.reporte import Reporte as ReporteSchema
from app.services.reporte import get_all_reportes, fetch_reportes_by_address

router = APIRouter(prefix="/reportes", tags=["reportes"])

@router.get("/", response_model=List[ReporteSchema])
async def list_reportes():
    try:
        reportes = await get_all_reportes()
        return [report.model_dump() for report in reportes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fetch/{direccion_hash}", response_model=List[ReporteSchema])
async def fetch_reportes(direccion_hash: str):
    try:
        reportes = await fetch_reportes_by_address(direccion_hash)
        return [report.model_dump() for report in reportes]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))