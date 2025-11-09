from pydantic import BaseModel
from typing import List, Optional

class BloqueInfo(BaseModel):
    id: Optional[str] = None
    numero_bloque: Optional[int] = None
    hash: Optional[str] = None
    fecha: Optional[str] = None
    recompensa_total: Optional[float] = None
    volumen_total: Optional[float] = None

class TrazaItem(BaseModel):
    hash: str
    monto_total: float
    estado: str
    patrones_sospechosos: Optional[List[str]] = []
    bloque: Optional[BloqueInfo]
    origen: Optional[List[str]] = []
    destino: Optional[List[str]] = []

    # --- nuevos campos forenses ---
    perfil_riesgo: Optional[str] = None
    ultimo_update_riesgo: Optional[str] = None 
    reportes_totales: Optional[int] = 0
    reportes_verificados: Optional[int] = 0
    reportes_no_verificados: Optional[int] = 0
    dominios_asociados: Optional[List[str]] = []
    categorias_denuncia: Optional[List[str]] = []

class TrazabilidadListOut(BaseModel):
    cantidad: int
    trazas: List[TrazaItem]
