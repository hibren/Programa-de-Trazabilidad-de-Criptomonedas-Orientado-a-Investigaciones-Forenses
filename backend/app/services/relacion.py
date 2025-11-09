from datetime import datetime
from app.database import relaciones_collection, analisis_collection, transaccion_collection
from app.models.relacion import RelacionModel
from typing import List
from fastapi import HTTPException
from collections import defaultdict
import asyncio

# ================================================================
# 📋 Obtener todas las relaciones
# ================================================================
async def get_all_relaciones(limit: int = 200) -> List[RelacionModel]:
    docs = await relaciones_collection.find().limit(limit).to_list(None)
    for d in docs:
        d["_id"] = str(d["_id"])
    return [RelacionModel(**d) for d in docs]


# ================================================================
# 🔗 Obtener relaciones de una dirección específica
# ================================================================
async def get_relaciones_by_direccion(direccion: str) -> List[RelacionModel]:
    docs = await relaciones_collection.find(
        {
            "$or": [
                {"direccion_origen": direccion},
                {"direccion_destino": direccion},
            ]
        }
    ).to_list(None)

    if not docs:
        raise HTTPException(status_code=404, detail="No se encontraron relaciones para esta dirección")

    for d in docs:
        d["_id"] = str(d["_id"])
    return [RelacionModel(**d) for d in docs]


# ================================================================
# 🧠 Detectar relaciones basadas en análisis (sin consultar API)
# ================================================================
async def detectar_relaciones():
    """
    Genera vínculos entre direcciones en base a:
    - dominios compartidos
    - categorías comunes
    - wallet_id compartido
    - cluster_id compartido
    - transacciones compartidas
    Fuente: colección 'analisis' + 'transacciones'
    """
    print("🔍 Generando relaciones a partir de análisis ya guardados en la BD...")
    relaciones_creadas = []

    # Índices auxiliares
    dominios_index = defaultdict(set)
    categoria_index = defaultdict(set)
    wallet_index = defaultdict(set)
    cluster_index = defaultdict(set)

    # 1️⃣ Leer todos los análisis locales (no consulta API)
    async for doc in analisis_collection.find({}, {
        "cluster.direccion": 1,
        "cluster.wallet_id": 1,
        "cluster.cluster_id": 1,
        "reportes": 1
    }):
        if not doc.get("cluster") or not doc["cluster"].get("direccion"):
            continue
        direccion = doc["cluster"]["direccion"][0]

        # índice por wallet
        if doc["cluster"].get("wallet_id"):
            wallet_index[doc["cluster"]["wallet_id"]].add(direccion)

        # índice por cluster_id
        if doc["cluster"].get("cluster_id"):
            cluster_index[doc["cluster"]["cluster_id"]].add(direccion)

        # índices por dominio y categoría
        for rep in doc.get("reportes", []):
            for d in rep.get("domains", []):
                dominios_index[d].add(direccion)
            if rep.get("scamCategory"):
                categoria_index[rep["scamCategory"]].add(direccion)

    # ============================================================
    # 2️⃣ Crear relaciones por dominio compartido
    # ============================================================
    print("🌐 Generando relaciones por dominios compartidos...")
    tasks = []
    for dominio, direcciones in dominios_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    tasks.append(save_relacion(dirs[i], dirs[j], "dominio_compartido", dominio))
                    relaciones_creadas.append((dirs[i], dirs[j], dominio))
    await asyncio.gather(*tasks)

    # ============================================================
    # 3️⃣ Crear relaciones por wallet compartida
    # ============================================================
    print("💼 Generando relaciones por wallets compartidas...")
    tasks = []
    for wallet, direcciones in wallet_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    tasks.append(save_relacion(dirs[i], dirs[j], "wallet_compartida", wallet))
                    relaciones_creadas.append((dirs[i], dirs[j], wallet))
    await asyncio.gather(*tasks)

    # ============================================================
    # 4️⃣ Crear relaciones por categoría compartida
    # ============================================================
    print("🏷️ Generando relaciones por categorías compartidas...")
    tasks = []
    for cat, direcciones in categoria_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    tasks.append(save_relacion(dirs[i], dirs[j], "categoria_compartida", cat))
                    relaciones_creadas.append((dirs[i], dirs[j], cat))
    await asyncio.gather(*tasks)

    # ============================================================
    # 5️⃣ Crear relaciones por cluster compartido
    # ============================================================
    print("🧩 Generando relaciones por clusters compartidos...")
    tasks = []
    for cid, direcciones in cluster_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    tasks.append(save_relacion(dirs[i], dirs[j], "cluster_compartido", cid))
                    relaciones_creadas.append((dirs[i], dirs[j], cid))
    await asyncio.gather(*tasks)

    # ============================================================
    # 6️⃣ Crear relaciones por transacción compartida
    # ============================================================
    print("🔗 Generando relaciones por transacciones compartidas...")
    async for tx in transaccion_collection.find({}, {"inputs": 1, "outputs": 1, "hash": 1}):
        direcciones = set(tx.get("inputs", []) + tx.get("outputs", []))
        if len(direcciones) > 1:
            dirs = list(direcciones)
            tx_hash = tx.get("hash", "sin_hash")
            tasks = [
                save_relacion(dirs[i], dirs[j], "transaccion_compartida", tx_hash)
                for i in range(len(dirs)) for j in range(i + 1, len(dirs))
            ]
            await asyncio.gather(*tasks)
            relaciones_creadas.extend([(dirs[i], dirs[j], tx_hash) for i in range(len(dirs)) for j in range(i + 1, len(dirs))])

    print(f"✅ Relaciones creadas o detectadas: {len(relaciones_creadas)}")
    return {"relaciones_creadas": len(relaciones_creadas)}


# ================================================================
# 💾 Guardar relación
# ================================================================
async def save_relacion(origen, destino, tipo, valor):
    """Guarda una relación si no existe ya (en ningún orden)."""
    doc = {
        "direccion_origen": origen,
        "direccion_destino": destino,
        "tipo_vinculo": tipo,
        "valor": valor,
        "fuente": "analisis_local",
        "fecha_detectado": datetime.utcnow(),
    }
    await relaciones_collection.update_one(
        {
            "$or": [
                {"direccion_origen": origen, "direccion_destino": destino, "tipo_vinculo": tipo, "valor": valor},
                {"direccion_origen": destino, "direccion_destino": origen, "tipo_vinculo": tipo, "valor": valor}
            ]
        },
        {"$setOnInsert": doc},
        upsert=True,
    )
