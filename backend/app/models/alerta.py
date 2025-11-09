from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AlertaModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    direccion: str
    tipo_alerta: str
    nivel_riesgo: str
    fecha: datetime = datetime.utcnow()
    transacciones: List[str] = []
    cluster: Optional[str] = None
