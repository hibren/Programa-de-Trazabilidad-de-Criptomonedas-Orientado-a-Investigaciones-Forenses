from pydantic import BaseModel

class DireccionCreateSchema(BaseModel):
    direccion: str

    
class DireccionResponseSchema(BaseModel):
    id: str
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

    class Config:
        orm_mode = True
