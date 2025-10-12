from pydantic import BaseModel
from typing import Optional, List
from datetime import date
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

class UsuarioCreate(BaseModel):
    username: str
    password: str
    perfil: PyObjectId
    activo: bool
    datos_personales: DatosPersonales
    contactos: List[Contacto]
    domicilios: List[Domicilio]

class UsuarioLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    email: str  # En realidad recibirá el email del front
    password: str