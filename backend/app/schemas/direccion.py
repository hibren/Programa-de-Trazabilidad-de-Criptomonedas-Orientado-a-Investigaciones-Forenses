from typing import Annotated
from pydantic import BaseModel, Field
from datetime import datetime
from app.database import PyObjectId

PyObjectIdField = Annotated[str, Field(description="Mongo ObjectId")]

class DireccionCreateSchema(BaseModel):
    direccion: str
    balance: float = 0
    unconfirmed_balance: float = 0
    final_balance: float = 0
    total_recibido: float = 0
    total_enviado: float = 0
    perfil_riesgo: str = "bajo"
    n_tx: int = 0
    unconfirmed_n_tx: int = 0
    final_n_tx: int = 0
    has_more: bool = False
    primer_tx: datetime | None = None
    ultima_tx: datetime | None = None

class DireccionFetchRequest(BaseModel):
    direccion: str

class DireccionResponseSchema(BaseModel):
    id: PyObjectIdField = Field(alias="_id")
    direccion: str
    balance: float
    unconfirmed_balance: float
    final_balance: float
    total_recibido: float
    total_enviado: float
    perfil_riesgo: str
    n_tx: int
    unconfirmed_n_tx: int
    final_n_tx: int
    has_more: bool
    primer_tx: datetime | None
    ultima_tx: datetime | None
