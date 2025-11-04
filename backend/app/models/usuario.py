from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from app.database import PyObjectId

class DatosPersonales(BaseModel):
    nombre: str
    apellido: str
    cuit: str
    fecha_nacimiento: date

class Contacto(BaseModel):
    tipo: str
    valor: str

class Domicilio(BaseModel):
    tipo: str
    pais: str
    provincia: str
    ciudad: str
    calle: str

class Usuario(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    password: str
    perfil: PyObjectId
    activo: bool
    datos_personales: DatosPersonales
    contactos: List[Contacto]
    domicilios: List[Domicilio]
    reset_password_token: Optional[str] = None
    reset_password_token_expiration: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}