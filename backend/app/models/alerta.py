from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from app.database import PyObjectId

class AlertaModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    tipo_alerta: str
    nivel_riesgo: str
    fecha: datetime = Field(default_factory=datetime.now)
    transacciones: List[PyObjectId] = Field(default_factory=list)
    cluster: PyObjectId

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
