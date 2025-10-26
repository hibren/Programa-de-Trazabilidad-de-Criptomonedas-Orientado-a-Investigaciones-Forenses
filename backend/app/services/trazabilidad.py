from app.database import direccion_collection, transaccion_collection, bloque_collection, reporte_collection
from app.schemas.direccion import DireccionResponseSchema
from app.schemas.bloque import BloqueResponseSchema
from app.models.transaccion import TransaccionModel
from typing import List, Optional
from app.services.reporte import fetch_reportes_by_address  
#from app.services.transaccion import fetch_and_save_transactions_by_address

async def obtener_trazas_por_direccion(direccion_str: str, saltos: int = 3):
    # 1️⃣ Buscar dirección
    direccion_doc = await direccion_collection.find_one({"direccion": direccion_str})
    if not direccion_doc:
        return {"error": f"No se encontró la dirección {direccion_str}"}
    direccion_doc["_id"] = str(direccion_doc["_id"])

    # 2️⃣ Obtener reportes de Chainabuse (desde BD o API)
    reportes = await fetch_reportes_by_address(direccion_str)
    categorias_chainabuse = list({r.scamCategory.upper() for r in reportes})
    dominios = list({d for r in reportes for d in getattr(r, "domains", [])})
    cantidad_reportes = len(reportes)
    reportes_verificados = len([r for r in reportes if r.trusted])
    reportes_no_verificados = cantidad_reportes - reportes_verificados

    # 3️⃣ Buscar transacciones
    transacciones = await transaccion_collection.find({
        "$or": [
            {"inputs": direccion_str},
            {"outputs": direccion_str}
        ]
    }).to_list(200)

    trazas = []
    for tx in transacciones:
        bloque_doc = await bloque_collection.find_one({"_id": tx.get("bloque")})
        if bloque_doc:
            bloque_doc["_id"] = str(bloque_doc["_id"])
            bloque_info = {
                "id": bloque_doc["_id"],
                "numero_bloque": bloque_doc["numero_bloque"],
                "hash": bloque_doc["hash"],
                "fecha": bloque_doc["fecha"].isoformat() if bloque_doc["fecha"] else None,
                "recompensa_total": bloque_doc["recompensa_total"],
                "volumen_total": bloque_doc["volumen_total"]
            }
        else:
            bloque_info = None

        trazas.append({
            "hash": tx["hash"],
            "monto_total": tx["monto_total"],
            "estado": tx["estado"],
            "categorias_denuncia": categorias_chainabuse,
            "bloque": bloque_info
        })

    # 4️⃣ Armar respuesta final
    return {
        "direccion": direccion_str,
        "perfil_riesgo": direccion_doc.get("perfil_riesgo", "desconocido"),
        "total_recibido": direccion_doc.get("total_recibido", 0),
        "total_enviado": direccion_doc.get("total_enviado", 0),
        "saltos": saltos,
        "cantidad_transacciones": len(trazas),
        "cantidad_reportes": cantidad_reportes,
        "reportes_verificados": reportes_verificados,
        "reportes_no_verificados": reportes_no_verificados,
        "dominios_asociados": dominios,
        "trazas": trazas
    }