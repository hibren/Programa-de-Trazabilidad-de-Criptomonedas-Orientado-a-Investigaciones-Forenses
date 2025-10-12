from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RelacionCreateSchema(BaseModel):
    direccion_origen: str
    direccion_destino: str
    tipo_vinculo: str
    valor: Optional[str] = None
    fuente: Optional[str] = None

class RelacionOut(BaseModel):
    id: str
    direccion_origen: str
    direccion_destino: str
    tipo_vinculo: str
    valor: Optional[str] = None
    fuente: Optional[str] = None
    fecha_detectado: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
