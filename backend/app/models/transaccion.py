from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.database import PyObjectId
from app.models.direccion import DireccionModel

class TransaccionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hash: str
    fecha: datetime
    inputs: List[DireccionModel]
    outputs: List[DireccionModel]
    monto_total: float
    estado: str
    patrones_sospechosos: List[str] = Field(default_factory=list)
    bloque: Optional[PyObjectId] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
        by_alias = True
