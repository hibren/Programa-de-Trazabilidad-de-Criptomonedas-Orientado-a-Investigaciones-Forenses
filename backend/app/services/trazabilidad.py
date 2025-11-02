from app.database import direccion_collection, transaccion_collection, bloque_collection, reporte_collection, PyObjectId
from app.schemas.direccion import DireccionResponseSchema
from app.schemas.bloque import BloqueResponseSchema
from app.models.transaccion import TransaccionModel
from typing import List, Optional
from app.services.reporte import fetch_reportes_by_address  
#from app.services.transaccion import fetch_and_save_transactions_by_address


async def obtener_todas_las_trazas():
    transacciones = await transaccion_collection.find({}).to_list(500)
    trazas = []

    for tx in transacciones:
        # --- Direcciones origen y destino ---
        origen = tx.get("inputs", [])
        destino = tx.get("outputs", [])
        direccion_ref = origen[0] if origen else (destino[0] if destino else None)

        # --- Información de dirección ---
        direccion_doc = None
        if direccion_ref:
            # si viene como string y es un ObjectId válido, convertir
            if PyObjectId.is_valid(direccion_ref):
                direccion_ref = PyObjectId(direccion_ref)
            direccion_doc = await direccion_collection.find_one({"_id": direccion_ref})
        perfil_riesgo = direccion_doc.get("perfil_riesgo", "desconocido") if direccion_doc else "desconocido"

        # --- Reportes (ChainAbuse + DB fallback) ---
        try:
            reportes = await fetch_reportes_by_address(direccion_ref) if direccion_ref else []
        except Exception as e:
            print(f"⚠️ Error al obtener reportes para {direccion_ref}: {e}")
            reportes = await reporte_collection.find({"id_direccion": direccion_ref}).to_list(50)

        categorias_chainabuse = list({
            r.scamCategory.upper() for r in reportes if hasattr(r, "scamCategory")
        })
        dominios = list({
            d for r in reportes for d in getattr(r, "domains", []) if d
        })
        cantidad_reportes = len(reportes)
        reportes_verificados = len([r for r in reportes if getattr(r, "trusted", False)])
        reportes_no_verificados = cantidad_reportes - reportes_verificados

        # --- Información del bloque asociado ---
        bloque_info = None
        bloque_ref = tx.get("bloque")

        if bloque_ref:
            # si el bloque es string, convertir a ObjectId
            if isinstance(bloque_ref, str) and PyObjectId.is_valid(bloque_ref):
                bloque_ref = PyObjectId(bloque_ref)

            bloque_doc = await bloque_collection.find_one({"_id": bloque_ref})
            if bloque_doc:
                bloque_info = {
                    "id": str(bloque_doc["_id"]),
                    "numero_bloque": bloque_doc.get("numero_bloque"),
                    "hash": bloque_doc.get("hash"),
                    "fecha": bloque_doc.get("fecha").isoformat() if bloque_doc.get("fecha") else None,
                    "recompensa_total": bloque_doc.get("recompensa_total"),
                    "volumen_total": bloque_doc.get("volumen_total"),
                }
            else:
                bloque_info = {
                    "id": None,
                    "numero_bloque": None,
                    "hash": "No disponible",
                    "fecha": None,
                    "recompensa_total": None,
                    "volumen_total": None,
                }

        # --- Construir la traza final ---
        trazas.append({
            "hash": tx.get("hash"),
            "monto_total": float(tx.get("monto_total", 0)),
            "estado": tx.get("estado", "desconocido"),
            "patrones_sospechosos": tx.get("patrones_sospechosos", []),
            "bloque": bloque_info,
            "origen": origen,
            "destino": destino,
            "perfil_riesgo": perfil_riesgo,
            "ultimo_update_riesgo": direccion_doc.get("ultimo_update_riesgo") if direccion_doc else None, 
            "reportes_totales": cantidad_reportes,
            "reportes_verificados": reportes_verificados,
            "reportes_no_verificados": reportes_no_verificados,
            "dominios_asociados": dominios,
            "categorias_denuncia": categorias_chainabuse
        })

    return {
        "cantidad": len(trazas),
        "trazas": trazas
    }

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