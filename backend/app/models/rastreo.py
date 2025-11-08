from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Conexion(BaseModel):
    nivel: int
    desde: str                   # dirección origen (string)
    hacia: str                   # dirección destino (string)
    monto: float
    hash: str
    estado: str
    fecha: Optional[str] = None  # fecha de la transacción

class RastreoModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    direccion_inicial: str
    tipo: str
    resultado: List[Conexion]
    total_conexiones: int
    fecha_analisis: datetime
    direcciones_analizadas: Optional[int] = 0

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

