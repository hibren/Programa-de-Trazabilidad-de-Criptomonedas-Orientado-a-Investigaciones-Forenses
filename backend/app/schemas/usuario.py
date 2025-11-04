from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import date
from app.database import PyObjectId

class UsuarioUpdatePerfilSchema(BaseModel):
    perfil_id: str = Field(..., alias="perfilId")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }

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

class UsuarioBase(BaseModel):
    username: EmailStr = Field(...)
    perfil: PyObjectId = Field(...)
    activo: bool = True
    datos_personales: DatosPersonales
    contactos: List[Contacto]
    domicilios: List[Domicilio]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class UsuarioCreate(BaseModel):
    username: EmailStr = Field(...)
    password: str = Field(...)
    perfil: str = Field(...)
    activo: bool = True
    datos_personales: DatosPersonales
    contactos: List[Contacto]
    domicilios: List[Domicilio]

class UsuarioUpdate(BaseModel):
    username: Optional[EmailStr] = None
    perfil: Optional[str] = None
    datos_personales: Optional[DatosPersonales] = None
    contactos: Optional[List[Contacto]] = None
    domicilios: Optional[List[Domicilio]] = None

class UsuarioResponseSchema(UsuarioBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str # Changed from email to username to match login logic
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str