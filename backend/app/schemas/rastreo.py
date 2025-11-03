from pydantic import BaseModel
from typing import List, Optional

class ConexionOut(BaseModel):
    nivel: int
    desde: str
    hacia: str
    monto: float
    hash: str
    estado: str
    fecha: Optional[str]

class RastreoOut(BaseModel):
    direccion_inicial: str
    tipo: str
    resultado: List[ConexionOut]
    total_conexiones: int
    fecha_analisis: str
