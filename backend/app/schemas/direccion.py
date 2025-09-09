# app/schemas.py
from pydantic import BaseModel

class DireccionCreateSchema(BaseModel):
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

class DireccionResponseSchema(DireccionCreateSchema):
    id: str
