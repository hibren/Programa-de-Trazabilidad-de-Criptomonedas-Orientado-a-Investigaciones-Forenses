from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from app.database import PyObjectId

class AlertaBaseSchema(BaseModel):
    tipo_alerta: str
    nivel_riesgo: str
    transacciones: List[PyObjectId]
    cluster: PyObjectId

class AlertaCreateSchema(AlertaBaseSchema):
    pass

class AlertaResponseSchema(AlertaBaseSchema):
    id: PyObjectId = Field(alias="_id")
    fecha: datetime

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        from_attributes = True
