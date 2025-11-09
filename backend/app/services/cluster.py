from app.database import cluster_collection, transaccion_collection
from app.models.cluster import ClusterModel
from typing import Optional
import httpx

# ======================= OBTENER TODOS LOS CLUSTERS =======================
async def get_all_clusters(limit: int = 100):
    docs = await cluster_collection.find().to_list(limit)
    result = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        result.append(ClusterModel(**doc))
    return result


# ======================= BUSCAR CLUSTER POR DIRECCIÓN =======================
async def get_cluster_by_address(address: str) -> Optional[ClusterModel]:
    print(f"🔍 Buscando en BD el cluster de la dirección {address}")
    doc = await cluster_collection.find_one({"direccion": {"$in": [address]}})
    if doc:
        print("✅ Encontrado en BD")
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return ClusterModel(**doc)
    print("❌ No encontrado en BD")
    return None


# ======================= API EXTERNA (Coincidencia de etiquetas) =======================
async def fetch_and_save_cluster(address: str) -> Optional[ClusterModel]:
    print(f"🌐 Consultando API externa (WalletExplorer) para la dirección {address}")
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
    doc["id"] = str(result.inserted_id)

    print(f"💾 Guardado en BD con id={doc['id']}")
    return ClusterModel(**doc)


# ======================= COINCIDENCIA DE TRANSACCIONES =======================
async def detectar_cluster_por_transacciones(address: str) -> Optional[ClusterModel]:
    """
    Detecta direcciones que compartieron transacciones (inputs/outputs) con la dirección base.
    """
    print(f"🔎 Buscando coincidencias de transacciones para {address}")

    try:
        pipeline = [
            {"$match": {"$or": [{"inputs": address}, {"outputs": address}]}},
            {"$project": {"direcciones": {"$setUnion": ["$inputs", "$outputs"]}}},
            {"$unwind": "$direcciones"},
            {"$group": {"_id": None, "relacionadas": {"$addToSet": "$direcciones"}}},
        ]

        # 👇 importante: usá el nombre correcto de la colección
        result = await transaccion_collection.aggregate(pipeline).to_list(1)

        if not result:
            print("⚠️ No se encontraron transacciones relacionadas")
            return None

        direcciones_relacionadas = result[0]["relacionadas"]
        if address not in direcciones_relacionadas:
            direcciones_relacionadas.append(address)

        print(f"✅ Cluster por transacciones detectado ({len(direcciones_relacionadas)} direcciones)")

        doc = {
            "id": "temp_" + address,
            "direccion": direcciones_relacionadas,
            "tipo_riesgo": None,
            "descripcion": f"Cluster por transacciones ({len(direcciones_relacionadas)} direcciones)",
            "wallet_id": None,
            "label": None,
            "updated_to_block": None,
        }

        return ClusterModel(**doc)

    except Exception as e:
        print(f"❌ Error en detectar_cluster_por_transacciones: {e}")
        return None
