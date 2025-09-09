from pydantic import BaseModel, Field
from app.database import PyObjectId

class DireccionCreateSchema(BaseModel):
    direccion: str
    balance: float = 0
    total_recibido: float = 0
    total_enviado: float = 0
    perfil_riesgo: str = "bajo"

class DireccionResponseSchema(BaseModel):
    id: PyObjectId = Field(alias="_id")
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
