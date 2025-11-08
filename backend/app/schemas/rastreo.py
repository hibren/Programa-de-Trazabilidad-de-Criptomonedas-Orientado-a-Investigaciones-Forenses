from pydantic import BaseModel, field_validator
from typing import List, Optional, Union

class ConexionOut(BaseModel):
    nivel: Optional[int] = None  # ✅ ahora es opcional
    desde: Union[str, List[str]]  # ✅ acepta string o lista
    hacia: str
    monto: float
    hash: str
    estado: str
    fecha: Optional[str] = None

    # 🔧 Normalizar 'desde' a string si viene como lista
    @field_validator("desde", mode="before")
    def flatten_desde(cls, v):
        if isinstance(v, list):
            return v[0] if v else ""
        return v

class RastreoOut(BaseModel):
    direccion_inicial: str
    tipo: str
    resultado: List[ConexionOut]
    total_conexiones: int
    fecha_analisis: str
