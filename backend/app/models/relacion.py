from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.database import PyObjectId

class RelacionModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    direccion_origen: str
    direccion_destino: str
    tipo_vinculo: str                     # dominio_compartido / transaccion_compartida
    valor: Optional[str] = None           # dominio o hash
    fuente: Optional[str] = None          # "reportes" o "transacciones"
    fecha_detectado: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        populate_by_name = True
        from_attributes = True
