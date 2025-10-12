from typing import Annotated, Optional
from pydantic import BaseModel, Field, ConfigDict
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
    primer_tx: Optional[datetime] = None
    ultima_tx: Optional[datetime] = None

class DireccionFetchRequest(BaseModel):
    direccion: str

class DireccionResponseSchema(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)  # ✅ CLAVE: Permite campos extra
    
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
    primer_tx: Optional[datetime] = None
    ultima_tx: Optional[datetime] = None
    ultimo_update_riesgo: Optional[datetime] = None
    total: Optional[int] = None
    cantidad_reportes: Optional[int] = None
    actividad: Optional[str] = None
    categorias: Optional[list[str]] = None
    ponderaciones: Optional[dict] = None