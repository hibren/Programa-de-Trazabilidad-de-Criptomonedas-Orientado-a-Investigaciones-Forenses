from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.database import PyObjectId

class ReporteProgramado(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    tipo: str
    formato: str
    frecuencia: str
    fecha_inicio: datetime
    hora_inicio: Optional[str] = None
    activo: bool = True
    creado_en: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        populate_by_name = True
