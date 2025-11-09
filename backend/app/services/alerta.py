from datetime import datetime
from bson import ObjectId

# Crear alerta
async def crear_alerta(db, alerta_data):
    alerta_data["fecha"] = datetime.utcnow()
    result = await db.alertas.insert_one(alerta_data)
    created = await db.alertas.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created


# Listar todas las alertas
async def listar_alertas(db):
    alertas = []
    async for alerta in db.alertas.find({}):
        if isinstance(alerta.get("direccion"), ObjectId):
            alerta["direccion"] = str(alerta["direccion"])
        alertas.append(alerta)
    return alertas

# Obtener una alerta por ID
async def get_alerta_by_id(db, alerta_id: str):
    alerta = await db.alertas.find_one({"_id": ObjectId(alerta_id)})
    if alerta:
        alerta["_id"] = str(alerta["_id"])
    return alerta


# Eliminar una alerta
async def delete_alerta(db, alerta_id: str):
    result = await db.alertas.delete_one({"_id": ObjectId(alerta_id)})
    return result.deleted_count > 0


async def generar_alerta_por_riesgo(db, direccion_id, nivel_riesgo, transacciones=None, cluster=None):
    tipo_alerta = {
        "Crítico": "lavado",
        "Alto": "fraude",
        "Medio": "monitoreo",
        "Bajo": "vinculo_riesgoso"
    }.get(nivel_riesgo)

    if not tipo_alerta:
        print(f"⚠️ No se genera alerta — nivel desconocido: {nivel_riesgo}")
        return None

    alerta = {
        "direccion": ObjectId(direccion_id),
        "tipo_alerta": tipo_alerta,
        "nivel_riesgo": nivel_riesgo,
        "fecha": datetime.utcnow(),
        "transacciones": transacciones or [],
        "cluster": cluster
    }

    existe = await db.alertas.find_one({
        "direccion": ObjectId(direccion_id),
        "nivel_riesgo": nivel_riesgo
    })

    if not existe:
        await db.alertas.insert_one(alerta)
        print(f"🚨 ALERTA generada para {direccion_id} → tipo={tipo_alerta}, nivel={nivel_riesgo}")
    else:
        print(f"ℹ️ Ya existe alerta para {direccion_id} con nivel {nivel_riesgo}")
