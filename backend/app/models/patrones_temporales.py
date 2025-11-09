from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class SerieTemporal(BaseModel):
    direccion: str
    conteos_por_hora: Dict[str, int]

class CorrelacionPatron(BaseModel):
    grupo: List[str]
    correlacion: float

class PatronTemporalModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    direcciones: List[str]
    ventana: str
    total_txs: int
    series: List[SerieTemporal]
    patrones: List[CorrelacionPatron]
    fecha_analisis: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
