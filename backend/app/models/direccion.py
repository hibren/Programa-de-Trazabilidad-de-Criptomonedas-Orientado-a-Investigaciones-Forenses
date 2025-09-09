from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import PyObjectId

class DireccionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
