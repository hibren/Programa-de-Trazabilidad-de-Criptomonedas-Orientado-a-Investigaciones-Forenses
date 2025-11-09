from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AlertaCreate(BaseModel):
    direccion: str
    tipo_alerta: str
    nivel_riesgo: str
    transacciones: Optional[List[str]] = []
    cluster: Optional[str] = None


class AlertaResponse(BaseModel):
    id: Optional[str] = None
    direccion: str
    tipo_alerta: str
    nivel_riesgo: str
    fecha: datetime
    transacciones: Optional[List[str]] = []
    cluster: Optional[str] = None
