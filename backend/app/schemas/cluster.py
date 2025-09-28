from pydantic import BaseModel, Field
from typing import List, Optional

class ClusterCreateSchema(BaseModel):
    direccion: List[str]
    tipo_riesgo: Optional[str] = None
    descripcion: Optional[str] = None

class ClusterOut(BaseModel):
    id: str = Field(alias="_id")  # 👈 alias para mapear ObjectId → str
    direccion: List[str]
    tipo_riesgo: Optional[str] = None
    descripcion: Optional[str] = None
    wallet_id: Optional[str] = None
    label: Optional[str] = None
    updated_to_block: Optional[int] = None

    class Config:
        populate_by_name = True
        from_attributes = True
