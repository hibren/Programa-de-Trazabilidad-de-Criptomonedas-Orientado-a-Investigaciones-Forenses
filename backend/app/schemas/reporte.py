from pydantic import BaseModel, Field
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
    id: str = Field(alias="_id")  # 👈 acá mapeás de Mongo a id

    class Config:
        from_attributes = True
        populate_by_name = True   # permite usar tanto `id` como `_id`
