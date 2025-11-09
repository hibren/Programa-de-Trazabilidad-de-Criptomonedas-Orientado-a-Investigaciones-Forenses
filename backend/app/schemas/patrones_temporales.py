from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class SerieTemporal(BaseModel):
    direccion: str
    conteos_por_hora: Dict[str, int]

class CorrelacionPatron(BaseModel):
    grupo: List[str]
    correlacion: float

# ✅ Para recibir el body del POST
class PatronTemporalIn(BaseModel):
    direcciones: List[str]
    ventana: Optional[str] = Field(default="24h", description="Ventana temporal: 24h, 7d o 30d")

# ✅ Para devolver la respuesta
class PatronTemporalOut(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    direcciones: List[str]
    ventana: str
    total_txs: int
    series: List[SerieTemporal]
    patrones: List[CorrelacionPatron]
    fecha_analisis: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
