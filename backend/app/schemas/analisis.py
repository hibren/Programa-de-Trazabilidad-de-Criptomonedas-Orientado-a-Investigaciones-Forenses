from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from app.schemas.cluster import ClusterOut
from app.schemas.reporte import Reporte


class AnalisisOut(BaseModel):
    id: str = Field(alias="_id")
    cluster: ClusterOut
    reportes: List[Reporte]
    riesgo: str
    descripcion: str
    createdAt: datetime

    class Config:
        populate_by_name = True
        from_attributes = True



class AnalisisRiesgoIn(BaseModel):
    """Body del endpoint /analisis/riesgo"""
    direccion: Optional[str] = None


class AnalisisRiesgoFactor(BaseModel):
    reportes: int
    categorias: List[str]
    actividad: str
    ponderaciones: Dict[str, float]


class AnalisisRiesgoRegistro(BaseModel):
    direccion: str
    puntaje_total: float
    nivel_riesgo: str
    factores: AnalisisRiesgoFactor
    fecha_analisis: datetime


class AnalisisRiesgoResultado(BaseModel):
    direccion: str
    nivel: str
    total: float
    cantidad_reportes: int
    categorias: List[str]
    actividad: str
    ponderaciones: Dict[str, float]
    fecha_analisis: datetime


class AnalisisRiesgoOut(BaseModel):
    analizadas: int
    resultados: List[AnalisisRiesgoResultado]

    class Config:
        populate_by_name = True
        from_attributes = True
