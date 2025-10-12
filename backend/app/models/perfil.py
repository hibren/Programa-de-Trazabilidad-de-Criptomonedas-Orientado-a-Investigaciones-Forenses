from pydantic import BaseModel, Field
from typing import List, Optional
from app.database import PyObjectId

class Funcion(BaseModel):
    nombre: str
    descripcion: str

class Modulo(BaseModel):
    nombre: str
    ruta: str
    funciones: List[Funcion]

class Perfil(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    descripcion: str
    nombre: str
    modulos: List[Modulo]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}