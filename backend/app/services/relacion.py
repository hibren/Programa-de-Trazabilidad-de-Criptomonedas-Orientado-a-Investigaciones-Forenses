from datetime import datetime
from app.database import relaciones_collection, analisis_collection
from app.models.relacion import RelacionModel
from typing import List
from fastapi import HTTPException
from collections import defaultdict

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
    Fuente: colección 'analisis'
    """
    print("🔍 Generando relaciones a partir de análisis ya guardados en la BD...")
    relaciones_creadas = []

    # Índices auxiliares
    dominios_index = defaultdict(set)
    categoria_index = defaultdict(set)
    wallet_index = defaultdict(set)

    # 1️⃣ Leer todos los análisis locales (no consulta API)
    async for doc in analisis_collection.find({}, {"cluster.direccion": 1, "reportes": 1, "cluster.wallet_id": 1}):
        if not doc.get("cluster") or not doc["cluster"].get("direccion"):
            continue
        direccion = doc["cluster"]["direccion"][0]

        # índice por wallet
        if doc["cluster"].get("wallet_id"):
            wallet_index[doc["cluster"]["wallet_id"]].add(direccion)

        # índices por dominio y categoría
        for rep in doc.get("reportes", []):
            for d in rep.get("domains", []):
                dominios_index[d].add(direccion)
            if rep.get("scamCategory"):
                categoria_index[rep["scamCategory"]].add(direccion)

    # 2️⃣ Crear relaciones por dominio compartido
    for dominio, direcciones in dominios_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    await save_relacion(dirs[i], dirs[j], "dominio_compartido", dominio)
                    relaciones_creadas.append((dirs[i], dirs[j], dominio))

    # 3️⃣ Crear relaciones por wallet compartida
    for wallet, direcciones in wallet_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    await save_relacion(dirs[i], dirs[j], "wallet_compartida", wallet)
                    relaciones_creadas.append((dirs[i], dirs[j], wallet))

    # 4️⃣ Crear relaciones por categoría compartida
    for cat, direcciones in categoria_index.items():
        if len(direcciones) > 1:
            dirs = list(direcciones)
            for i in range(len(dirs)):
                for j in range(i + 1, len(dirs)):
                    await save_relacion(dirs[i], dirs[j], "categoria_compartida", cat)
                    relaciones_creadas.append((dirs[i], dirs[j], cat))

    print(f"✅ Relaciones creadas: {len(relaciones_creadas)}")
    return {"relaciones_creadas": len(relaciones_creadas)}


# ================================================================
# 💾 Guardar relación
# ================================================================
async def save_relacion(origen, destino, tipo, valor):
    doc = {
        "direccion_origen": origen,
        "direccion_destino": destino,
        "tipo_vinculo": tipo,
        "valor": valor,
        "fuente": "chainabuse",
        "fecha_detectado": datetime.utcnow(),
    }
    await relaciones_collection.update_one(
        {
            "direccion_origen": origen,
            "direccion_destino": destino,
            "tipo_vinculo": tipo,
            "valor": valor,
        },
        {"$setOnInsert": doc},
        upsert=True,
    )
