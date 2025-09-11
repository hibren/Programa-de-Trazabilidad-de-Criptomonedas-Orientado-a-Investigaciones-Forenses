from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.database import PyObjectId

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
    id: str = Field(alias="_id")
    hash: str
    fecha: datetime
    inputs: List[str]  # IDs como strings
    outputs: List[str]  # IDs como strings
    monto_total: float
    estado: str
    patrones_sospechosos: List[str]
    bloque: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
        by_alias = True