from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.cluster import ClusterOut
from app.services.cluster import get_all_clusters, get_cluster_by_address, fetch_and_save_cluster
from app.security import check_permissions_auto
from app.models.usuario import Usuario

router = APIRouter(prefix="/clusters", tags=["clusters"])

@router.get("/", response_model=List[ClusterOut])
async def list_clusters(current_user: Usuario = Depends(check_permissions_auto)):
    try:
        clusters = await get_all_clusters()
        return clusters   # 👈 devolvemos los modelos, FastAPI hace el trabajo
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-address/{address}", response_model=ClusterOut)
async def get_cluster(address: str, current_user: Usuario = Depends(check_permissions_auto)):
    # 1️⃣ Buscar en BD primero
    cluster = await get_cluster_by_address(address)
    if cluster:
        return cluster

    # 2️⃣ Si no está en BD, lo traemos de la API y lo guardamos
    cluster = await fetch_and_save_cluster(address)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster no encontrado")
    return cluster
