from typing import Annotated
from pydantic import BaseModel, Field
from app.database import PyObjectId

PyObjectIdField = Annotated[str, Field(description="Mongo ObjectId")]

class DireccionCreateSchema(BaseModel):
    direccion: str
    balance: float = 0
    total_recibido: float = 0
    total_enviado: float = 0
    perfil_riesgo: str = "bajo"

class DireccionFetchRequest(BaseModel):
    direccion: str

class DireccionResponseSchema(BaseModel):
    id: PyObjectIdField = Field(alias="_id")
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str