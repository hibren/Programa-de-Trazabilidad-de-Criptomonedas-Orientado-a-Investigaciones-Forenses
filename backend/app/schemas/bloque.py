from typing import Annotated
from pydantic import BaseModel, Field
from app.database import PyObjectId
from datetime import datetime

PyObjectIdField = Annotated[str, Field(description="Mongo ObjectId")]

class BloqueCreateSchema(BaseModel):
    numero_bloque: int
    hash: str
    fecha: datetime
    recompensa_total: float = 0
    volumen_total: float = 0

class BloqueFetchRequest(BaseModel):
    hash: str

class BloqueResponseSchema(BaseModel):
    id: PyObjectIdField = Field(alias="_id")
    numero_bloque: int
    hash: str
    fecha: datetime
    recompensa_total: float
    volumen_total: float
