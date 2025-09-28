from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.cluster import ClusterOut
from app.services.cluster import get_all_clusters, get_cluster_by_address, fetch_and_save_cluster

router = APIRouter(prefix="/clusters", tags=["clusters"])

@router.get("/", response_model=List[ClusterOut])
async def list_clusters():
    try:
        clusters = await get_all_clusters()
        return clusters   # 👈 devolvemos los modelos, FastAPI hace el trabajo
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-address/{address}", response_model=ClusterOut)
async def get_cluster(address: str):
    # 1️⃣ Buscar en BD primero
    cluster = await get_cluster_by_address(address)
    if cluster:
        return cluster

    # 2️⃣ Si no está en BD, lo traemos de la API y lo guardamos
    cluster = await fetch_and_save_cluster(address)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster no encontrado")
    return cluster
