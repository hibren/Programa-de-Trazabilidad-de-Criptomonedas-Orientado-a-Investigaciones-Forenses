from pydantic import BaseModel

class DireccionResponseSchema(BaseModel):
    id: str
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

    class Config:
        orm_mode = True
