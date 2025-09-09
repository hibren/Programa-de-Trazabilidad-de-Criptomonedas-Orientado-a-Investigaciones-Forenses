from pydantic import BaseModel, Field
from app.database import PyObjectId
from datetime import date

class BloqueModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    numero_bloque: int
    hash: str
    fecha: date
    recompensa_total: float
    volumen_total: float

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        allow_population_by_field_name = True
        by_alias = True
