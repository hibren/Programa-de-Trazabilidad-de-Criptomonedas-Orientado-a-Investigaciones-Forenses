from app.database import analisis_collection, cluster_collection, reporte_collection
from app.models.analisis import AnalisisModel
from app.models.cluster import ClusterModel
from app.models.reporte import ReporteModel
from datetime import datetime
from typing import List, Optional

async def generar_analisis(cluster_id: str) -> Optional[AnalisisModel]:
    # Traer cluster
    cluster_doc = await cluster_collection.find_one({"_id": cluster_id})
    if not cluster_doc:
        return None
    cluster_doc["_id"] = str(cluster_doc["_id"])
    cluster = ClusterModel(**cluster_doc)

    # Traer reportes de todas las direcciones
    reportes_docs = await reporte_collection.find({
        "id_direccion": {"$in": cluster.direccion}
    }).to_list(200)

    reportes = [ReporteModel(**{**r, "_id": str(r["_id"])}) for r in reportes_docs]

    # Calcular riesgo
    categorias = [r.scamCategory for r in reportes]
    if "RANSOMWARE" in categorias or "FAKE_RETURNS" in categorias:
        riesgo = "Alto"
    elif categorias:
        riesgo = "Medio"
    else:
        riesgo = "Bajo"

    analisis_doc = {
        "cluster": cluster.dict(by_alias=True),
        "reportes": [r.dict(by_alias=True) for r in reportes],
        "riesgo": riesgo,
        "descripcion": f"Análisis generado con {len(reportes)} reportes",
        "createdAt": datetime.utcnow()
    }

    result = await analisis_collection.insert_one(analisis_doc)
    analisis_doc["_id"] = str(result.inserted_id)

    return AnalisisModel(**analisis_doc)

async def get_all_analisis(limit: int = 50) -> List[AnalisisModel]:
    docs = await analisis_collection.find().to_list(limit)
    for d in docs:
        d["_id"] = str(d["_id"])
    return [AnalisisModel(**d) for d in docs]
