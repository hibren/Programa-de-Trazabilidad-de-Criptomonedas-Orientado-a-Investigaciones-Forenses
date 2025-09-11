from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.database import PyObjectId

class TransaccionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hash: str
    fecha: datetime
    inputs: List[PyObjectId] = Field(default_factory=list)
    outputs: List[PyObjectId] = Field(default_factory=list)
    monto_total: float
    estado: str
    patrones_sospechosos: List[str] = Field(default_factory=list)
    bloque: Optional[PyObjectId] = None

    @field_validator('patrones_sospechosos', mode='before')
    @classmethod
    def validate_patrones_sospechosos(cls, v):
        # Si es string vacío o None, devolver lista vacía
        if v == '' or v is None:
            return []
        # Si ya es una lista, devolverla tal como está
        if isinstance(v, list):
            return v
        # Si es string no vacío, convertir a lista con un elemento
        if isinstance(v, str):
            return [v]
        return v

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
        by_alias = True