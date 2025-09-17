from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReporteBase(BaseModel):
    chainabuse_id: Optional[str] = None
    id_direccion: str
    scamCategory: str
    createdAt: datetime
    trusted: bool
    domains: List[str]

class ReporteCreate(ReporteBase):
    pass

class Reporte(ReporteBase):
    id: str

    class Config:
        from_attributes = True