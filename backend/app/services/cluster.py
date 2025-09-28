from app.database import cluster_collection
from app.models.cluster import ClusterModel
from typing import Optional
import httpx

# services/cluster.py

async def get_all_clusters(limit: int = 100):
    docs = await cluster_collection.find().to_list(limit)
    result = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])   # 👈 convertir ObjectId a str
        result.append(ClusterModel(**doc))
    return result


async def get_cluster_by_address(address: str) -> Optional[ClusterModel]:
    print(f"🔍 Buscando en BD el cluster de la dirección {address}")
    doc = await cluster_collection.find_one({"direccion": {"$in": [address]}})
    if doc:
        print("✅ Encontrado en BD")
        doc["_id"] = str(doc["_id"])
        return ClusterModel(**doc)
    print("❌ No encontrado en BD")
    return None


async def fetch_and_save_cluster(address: str) -> Optional[ClusterModel]:
    print(f"🌐 Consultando API externa para la dirección {address}")
    url = f"https://www.walletexplorer.com/api/1/address-lookup?address={address}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        data = r.json()

    if not data.get("found"):
        print("⚠️ API: No se encontró cluster para esa dirección")
        return None

    print("✅ API devolvió resultados, guardando en BD...")

    doc = {
        "direccion": [address],
        "tipo_riesgo": None,
        "descripcion": f"Cluster detectado: {data.get('label')}" if data.get("label") else None,
        "wallet_id": data.get("wallet_id"),
        "label": data.get("label"),
        "updated_to_block": data.get("updated_to_block"),
    }

    result = await cluster_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    print(f"💾 Guardado en BD con _id={doc['_id']}")
    return ClusterModel(**doc)
