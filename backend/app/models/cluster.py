# app/models/cluster.py
from pydantic import BaseModel, Field
from app.database import PyObjectId
from typing import List, Optional

class ClusterModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    direccion_base: Optional[str] = None        # 👈 NUEVO
    direccion: List[str]
    tipo_riesgo: Optional[str] = None
    descripcion: Optional[str] = None
    wallet_id: Optional[str] = None
    label: Optional[str] = None
    updated_to_block: Optional[int] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        populate_by_name = True
        from_attributes = True
