from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from app.schemas.cluster import ClusterOut
from app.services.cluster import (
    get_all_clusters,
    get_cluster_by_address,
    fetch_and_save_cluster,
    detectar_cluster_por_transacciones,
)
from app.security import check_permissions_auto
from app.models.usuario import Usuario
from app.models.cluster import ClusterModel
from app.services.cluster import generar_analisis_cluster

# ✅ Solo una instancia del router
router = APIRouter(prefix="/clusters", tags=["Clusters"])

# ==================== LISTAR TODOS LOS CLUSTERS ====================
@router.get("/", response_model=List[ClusterOut])
async def list_clusters(current_user: Usuario = Depends(check_permissions_auto)):
    try:
        clusters = await get_all_clusters()
        return clusters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== OBTENER CLUSTER POR DIRECCIÓN ====================
@router.get("/by-address/{address}", response_model=ClusterOut)
async def get_cluster(address: str, current_user: Usuario = Depends(check_permissions_auto)):
    cluster = await get_cluster_by_address(address)
    if cluster:
        return cluster

    cluster = await fetch_and_save_cluster(address)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster no encontrado")
    return cluster

# ==================== DETECTAR CLUSTER ====================
@router.get("/detectar", response_model=ClusterModel)
async def detectar_cluster(
    direccion: str = Query(..., description="Dirección base a analizar"),
    algoritmo: str = Query("coincidencia-etiquetas", description="Algoritmo de detección"),
):
    print(f"🔍 Detección de cluster | dirección={direccion} | algoritmo={algoritmo}")

    if algoritmo == "coincidencia-etiquetas":
        cluster = await get_cluster_by_address(direccion)
        if cluster:
            return cluster
        cluster = await fetch_and_save_cluster(direccion)
        if not cluster:
            raise HTTPException(status_code=404, detail="No se encontró cluster para la dirección")
        return cluster

    elif algoritmo == "coincidencia-transacciones":
        cluster = await detectar_cluster_por_transacciones(direccion)
        if not cluster:
            raise HTTPException(status_code=404, detail="No se detectaron direcciones relacionadas")
        return cluster

    else:
        raise HTTPException(status_code=400, detail=f"Algoritmo desconocido: {algoritmo}")





@router.get("/analizar/{address}")
async def analizar_cluster(address: str, current_user: Usuario = Depends(check_permissions_auto)):
    result = await generar_analisis_cluster(address)
    if not result:
        raise HTTPException(404, "No se pudo generar riesgo del cluster")
    return result