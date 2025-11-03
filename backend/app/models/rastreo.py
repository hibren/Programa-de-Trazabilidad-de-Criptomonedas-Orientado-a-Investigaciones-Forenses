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
    id: Optional[str] = Field(alias="_id")
    direccion_inicial: str
    tipo: str                    # "origen" o "destino"
    resultado: List[Conexion]
    total_conexiones: int
    fecha_analisis: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
