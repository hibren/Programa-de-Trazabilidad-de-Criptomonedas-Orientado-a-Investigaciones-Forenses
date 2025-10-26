# schemas/trazabilidad.py
from pydantic import BaseModel
from typing import List, Optional

class TrazabilidadOut(BaseModel):
    direccion: str
    saltos: int
    trazas: List[dict]
