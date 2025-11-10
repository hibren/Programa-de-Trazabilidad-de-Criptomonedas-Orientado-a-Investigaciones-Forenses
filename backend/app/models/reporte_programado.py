from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from app.database import PyObjectId

class ReporteProgramado(BaseModel):
    """Modelo para documento de MongoDB"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    nombre: str
    tipo: Literal["riesgo", "actividad", "clusters"]
    formato: Literal["PDF", "CSV"]
    frecuencia: Literal["diario", "semanal", "mensual"]
    fecha_inicio: datetime
    activo: bool = True
    
    # Metadatos del sistema
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)
    ultima_ejecucion: Optional[datetime] = None
    proxima_ejecucion: Optional[datetime] = None
    total_ejecuciones: int = 0
    
    # Parámetros específicos según tipo de reporte
    direccion_hash: Optional[str] = None
    fecha_inicio_periodo: Optional[str] = None
    fecha_fin_periodo: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        populate_by_name = True
        schema_extra = {
            "example": {
                "_id": "68c95ff85c5180f9ff238ec7",
                "nombre": "Reporte Semanal de Riesgo",
                "tipo": "riesgo",
                "formato": "PDF",
                "frecuencia": "semanal",
                "fecha_inicio": "2024-01-15T10:00:00",
                "activo": True,
                "createdAt": "2024-01-15T10:00:00",
                "updatedAt": "2024-01-15T10:00:00",
                "ultima_ejecucion": None,
                "proxima_ejecucion": "2024-01-22T10:00:00",
                "total_ejecuciones": 0,
                "direccion_hash": "0x1234567890abcdef",
                "fecha_inicio_periodo": None,
                "fecha_fin_periodo": None
            }
        }