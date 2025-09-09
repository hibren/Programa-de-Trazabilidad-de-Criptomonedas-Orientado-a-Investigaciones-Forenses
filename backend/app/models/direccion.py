from pydantic import BaseModel, Field
from app.database import PyObjectId


from pydantic import BaseModel, Field
from app.database import PyObjectId

class DireccionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")  # <-- nombre Pydantic: id, alias Mongo: _id
    direccion: str
    balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        allow_population_by_field_name = True  # permite usar id al crear/serializar
        by_alias = True  # usa _id al serializar a JSON


