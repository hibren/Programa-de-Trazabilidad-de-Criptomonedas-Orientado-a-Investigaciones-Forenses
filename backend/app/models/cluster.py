from pydantic import BaseModel
from typing import List, Optional

class ClusterModel(BaseModel):
    id: Optional[str]
    direccion: List[str]
    tipo_riesgo: Optional[str] = None
    descripcion: Optional[str] = None
    wallet_id: Optional[str] = None
    label: Optional[str] = None
    updated_to_block: Optional[int] = None

    class Config:
        populate_by_name = True
        from_attributes = True
