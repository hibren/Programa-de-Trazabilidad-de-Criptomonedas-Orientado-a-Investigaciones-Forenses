from app.database import cluster_collection, transaccion_collection
from app.models.cluster import ClusterModel
from typing import Optional, List
import httpx
from bson import ObjectId

# ======================= OBTENER TODOS LOS CLUSTERS =======================
async def get_all_clusters(limit: int = 100) -> List[ClusterModel]:
    """
    Devuelve todos los clusters almacenados en la base de datos.
    """
    docs = await cluster_collection.find().to_list(limit)
    result = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        result.append(ClusterModel(**doc))
    return result


# ======================= BUSCAR CLUSTER POR DIRECCIÓN =======================
async def get_cluster_by_address(address: str) -> Optional[ClusterModel]:
    """
    Busca un cluster en la base de datos que contenga la dirección dada.
    """
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
    """
    Consulta la API de WalletExplorer y guarda la información del cluster en la base.
    """
    print(f"🌐 Consultando API externa (WalletExplorer) para la dirección {address}")
    url = f"https://www.walletexplorer.com/api/1/address-lookup?address={address}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url)
            data = r.json()
    except Exception as e:
        print(f"❌ Error al conectar con la API externa: {e}")
        return None

    if not data.get("found"):
        print("⚠️ API: No se encontró cluster para esa dirección")
        return None

    print("✅ API devolvió resultados, guardando en BD...")

    doc = {
        "direccion_base": address,
        "direccion": [address],
        "tipo_riesgo": None,
        "descripcion": f"Cluster detectado: {data.get('label')}"
        if data.get("label")
        else "Cluster detectado (sin etiqueta)",
        "wallet_id": data.get("wallet_id"),
        "label": data.get("label"),
        "updated_to_block": data.get("updated_to_block"),
    }

    result = await cluster_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    print(f"💾 Guardado en BD con _id={doc['_id']} | label={data.get('label')}")
    return ClusterModel(**doc)


# ======================= COINCIDENCIA DE TRANSACCIONES (ENRIQUECIDA) =======================
async def detectar_cluster_por_transacciones(address: str) -> Optional[ClusterModel]:
    """
    Detecta direcciones que compartieron transacciones (inputs/outputs) con la dirección base.
    Si existe información en la BD o en la API externa, enriquece el resultado con esos datos.
    """
    print(f"🔎 Buscando coincidencias de transacciones para {address}")

    try:
        pipeline = [
            {"$match": {"$or": [{"inputs": address}, {"outputs": address}]}},
            {"$project": {"direcciones": {"$setUnion": ["$inputs", "$outputs"]}}},
            {"$unwind": "$direcciones"},
            {"$group": {"_id": None, "relacionadas": {"$addToSet": "$direcciones"}}},
        ]

        result = await transaccion_collection.aggregate(pipeline).to_list(1)

        if not result:
            print("⚠️ No se encontraron transacciones relacionadas")
            return None

        relacionadas = result[0]["relacionadas"]

        # Asegurar que la base esté incluida
        if address not in relacionadas:
            relacionadas.append(address)

        # Ordenar → base primero
        relacionadas_ordenadas = [address] + sorted(
            [d for d in relacionadas if d != address]
        )

        # =================== ENRIQUECER CON DATOS DE BD O API ===================
        print("🧩 Enriqueciendo cluster con información adicional...")
        base_metadata = await get_cluster_by_address(address)

        if not base_metadata:
            print("🌐 No se encontró en BD. Consultando API externa...")
            base_metadata = await fetch_and_save_cluster(address)

        # Construir documento final con datos enriquecidos
        doc = {
            "_id": ObjectId(),
            "direccion_base": address,
            "direccion": relacionadas_ordenadas,
            "tipo_riesgo": base_metadata.tipo_riesgo if base_metadata else None,
            "descripcion": f"Cluster por transacciones ({len(relacionadas_ordenadas)} direcciones)",
            "wallet_id": base_metadata.wallet_id if base_metadata else None,
            "label": base_metadata.label if base_metadata else None,
            "updated_to_block": base_metadata.updated_to_block if base_metadata else None,
        }

        # Guardar el cluster detectado para futuras consultas
        await cluster_collection.insert_one(doc)

        print(f"✅ Cluster detectado y guardado con base {address}")
        return ClusterModel(**doc)

    except Exception as e:
        print(f"❌ Error en detectar_cluster_por_transacciones: {e}")
        return None
