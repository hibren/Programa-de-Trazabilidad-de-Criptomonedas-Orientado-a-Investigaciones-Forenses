from pydantic import BaseModel, Field
from app.database import PyObjectId
from datetime import datetime

class DireccionModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    direccion: str
    balance: float
    unconfirmed_balance: float = 0
    final_balance: float = 0
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str = "bajo"
    n_tx: int = 0
    unconfirmed_n_tx: int = 0
    final_n_tx: int = 0
    has_more: bool = False
    primer_tx: datetime | None = None
    ultima_tx: datetime | None = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        allow_population_by_field_name = True
        by_alias = True
