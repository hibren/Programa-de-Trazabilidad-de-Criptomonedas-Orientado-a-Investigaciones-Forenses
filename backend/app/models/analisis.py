from pydantic import BaseModel, Field
from typing import List
from app.database import PyObjectId
from app.models.cluster import ClusterModel
from app.models.reporte import Reporte  # 👈 ya lo tenés
from datetime import datetime

class AnalisisModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    cluster: ClusterModel          # 👈 se embebe el cluster
    reportes: List[Reporte]   # 👈 se embeben los reportes
    riesgo: str
    descripcion: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        populate_by_name = True
        from_attributes = True
