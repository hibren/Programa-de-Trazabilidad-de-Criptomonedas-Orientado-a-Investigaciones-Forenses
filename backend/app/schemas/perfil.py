from pydantic import BaseModel, Field
from typing import List, Optional
from ..database import PyObjectId

class FuncionSchema(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""

class ModuloSchema(BaseModel):
    nombre: str
    ruta: str
    funciones: List[FuncionSchema] = []

class PerfilBaseSchema(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    modulos: List[ModuloSchema] = []

class PerfilCreateSchema(PerfilBaseSchema):
    pass

class PerfilUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    modulos: Optional[List[ModuloSchema]] = None

class PerfilResponseSchema(PerfilBaseSchema):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

#class PerfilInDB(PerfilBaseSchema):
#    pass