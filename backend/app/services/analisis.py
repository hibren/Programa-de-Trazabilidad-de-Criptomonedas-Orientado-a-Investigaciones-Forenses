# services/analisis.py
from app.database import analisis_collection
from app.services.cluster import get_cluster_by_address, fetch_and_save_cluster
from app.services.reporte import fetch_reportes_by_address
from app.models.analisis import AnalisisModel
from app.schemas.reporte import Reporte
from datetime import datetime
from typing import Optional, List

async def get_all_analisis():
    docs = await analisis_collection.find().to_list(100)
    return [AnalisisModel(**doc).dict(by_alias=True) for doc in docs]


async def generar_analisis_por_direccion(address: str) -> Optional[AnalisisModel]:
    # 1. Buscar cluster
    cluster = await get_cluster_by_address(address)
    if not cluster:
        cluster = await fetch_and_save_cluster(address)
    if not cluster:
        return None

    # 2. Buscar reportes
    reportes = []
    for dir_ in cluster.direccion:
        r = await fetch_reportes_by_address(dir_)
        reportes.extend(r)

    # 3. Calcular riesgo
    categorias = [rep.scamCategory for rep in reportes]
    if "RANSOMWARE" in categorias or "FAKE_RETURNS" in categorias:
        riesgo = "Alto"
    elif categorias:
        riesgo = "Medio"
    else:
        riesgo = "Bajo"

    analisis_doc = {
        "cluster": cluster.dict(by_alias=True),
        "reportes": [Reporte(**r.dict(by_alias=True)).dict(by_alias=True) for r in reportes],
        "riesgo": riesgo,
        "descripcion": f"Análisis generado para {address} con {len(reportes)} reportes",
        "createdAt": datetime.utcnow()
    }

    result = await analisis_collection.insert_one(analisis_doc)
    analisis_doc["_id"] = str(result.inserted_id)

    return AnalisisModel(**analisis_doc)
