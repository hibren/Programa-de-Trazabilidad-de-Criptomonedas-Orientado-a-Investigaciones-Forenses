# models/trazabilidad.py
from pydantic import BaseModel
from typing import List, Optional

class Trazabilidad(BaseModel):
    hash: str
    monto_total: float
    estado: str
    patrones_sospechosos: Optional[List[str]] = []
    bloque: Optional[str] = None
