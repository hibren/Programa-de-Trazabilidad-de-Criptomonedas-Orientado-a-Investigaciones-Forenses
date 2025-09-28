from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from app.schemas.cluster import ClusterOut
from app.schemas.reporte import Reporte  # 👈 schema ya definido

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
