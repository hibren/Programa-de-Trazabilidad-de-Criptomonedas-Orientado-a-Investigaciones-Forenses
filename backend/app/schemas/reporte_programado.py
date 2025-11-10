from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class ReporteProgramadoBase(BaseModel):
    """Base schema con campos comunes"""
    nombre: str = Field(..., min_length=3, max_length=200, description="Nombre descriptivo del reporte")
    tipo: Literal["riesgo", "actividad", "clusters"] = Field(..., description="Tipo de reporte")
    formato: Literal["PDF", "CSV"] = Field(..., description="Formato de salida")
    frecuencia: Literal["diario", "semanal", "mensual"] = Field(..., description="Frecuencia de ejecución")
    fecha_inicio: datetime = Field(..., description="Fecha y hora de inicio de ejecución")
    activo: bool = Field(default=True, description="Estado del reporte programado")
    
    # Parámetros específicos según tipo de reporte
    direccion_hash: Optional[str] = Field(None, description="Dirección para reportes de riesgo")
    fecha_inicio_periodo: Optional[str] = Field(None, description="Inicio del período para reportes de actividad")
    fecha_fin_periodo: Optional[str] = Field(None, description="Fin del período para reportes de actividad")


class ReporteProgramadoCreate(ReporteProgramadoBase):
    """Schema para crear un nuevo reporte programado"""
    
    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Reporte Semanal de Riesgo",
                "tipo": "riesgo",
                "formato": "PDF",
                "frecuencia": "semanal",
                "fecha_inicio": "2024-01-15T10:00:00",
                "activo": True,
                "direccion_hash": "0x1234567890abcdef",
                "fecha_inicio_periodo": None,
                "fecha_fin_periodo": None
            }
        }


class ReporteProgramadoUpdate(BaseModel):
    """Schema para actualizar un reporte programado (todos los campos opcionales)"""
    nombre: Optional[str] = Field(None, min_length=3, max_length=200)
    tipo: Optional[Literal["riesgo", "actividad", "clusters"]] = None
    formato: Optional[Literal["PDF", "CSV"]] = None
    frecuencia: Optional[Literal["diario", "semanal", "mensual"]] = None
    fecha_inicio: Optional[datetime] = None
    activo: Optional[bool] = None
    direccion_hash: Optional[str] = None
    fecha_inicio_periodo: Optional[str] = None
    fecha_fin_periodo: Optional[str] = None


class ReporteProgramadoResponse(ReporteProgramadoBase):
    """Schema de respuesta al cliente"""
    id: str = Field(alias="_id")  # Mapea _id de Mongo a id
    createdAt: datetime
    updatedAt: datetime
    ultima_ejecucion: Optional[datetime] = None
    proxima_ejecucion: Optional[datetime] = None
    total_ejecuciones: int = 0

    class Config:
        from_attributes = True
        populate_by_name = True  # Permite usar tanto id como _id