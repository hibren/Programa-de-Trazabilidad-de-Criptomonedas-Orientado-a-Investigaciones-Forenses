from datetime import datetime
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field
from app.database import PyObjectId
from app.schemas.direccion import DireccionResponseSchema

PyObjectIdField = Annotated[str, Field(description="Mongo ObjectId")]

class TransaccionCreateSchema(BaseModel):
    hash: str
    fecha: datetime
    inputs: List[str]
    outputs: List[str]
    monto_total: float
    estado: str
    patrones_sospechosos: List[str] = Field(default_factory=list)
    bloque: Optional[str] = None

class TransaccionResponseSchema(BaseModel):
    id: PyObjectIdField = Field(alias="_id")
    hash: str
    fecha: datetime
    inputs: List[DireccionResponseSchema]
    outputs: List[DireccionResponseSchema]
    monto_total: float
    estado: str
    patrones_sospechosos: List[str]
    bloque: Optional[PyObjectIdField] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
        by_alias = True
