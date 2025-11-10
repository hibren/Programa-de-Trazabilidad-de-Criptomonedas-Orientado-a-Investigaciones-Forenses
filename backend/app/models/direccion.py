from pydantic import BaseModel, Field, ConfigDict, field_serializer
from app.database import PyObjectId
from datetime import datetime
from typing import Optional, List

class DireccionModel(BaseModel):
    model_config = ConfigDict(
        extra="allow", 
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )  # ✅ Permite campos extra y tipos arbitrarios
    
    id: PyObjectId = Field(alias="_id")
    
    @field_serializer('id')
    def serialize_id(self, value):
        return str(value) if value else None
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
    primer_tx: Optional[datetime] = None
    ultima_tx: Optional[datetime] = None
    bloques: Optional[List[int]] = []   # 👈 AGREGA ESTO
    
    # ✅ CAMPOS NUEVOS DEL ANÁLISIS
    ultimo_update_riesgo: Optional[str] = None
    total: Optional[int] = None
    cantidad_reportes: Optional[int] = None
    actividad: Optional[str] = None
    categorias: Optional[list] = None
    ponderaciones: Optional[dict] = None
    