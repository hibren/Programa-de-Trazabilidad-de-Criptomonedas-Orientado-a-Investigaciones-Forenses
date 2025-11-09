from app.database import direccion_collection, transaccion_collection, bloque_collection, reporte_collection, PyObjectId
from app.schemas.direccion import DireccionResponseSchema
from app.schemas.bloque import BloqueResponseSchema
from app.models.transaccion import TransaccionModel
from typing import List, Optional
from app.services.reporte import fetch_reportes_by_address  
from app.services.transaccion import fetch_and_save_transactions_by_address
from datetime import datetime

async def obtener_todas_las_trazas(limit: int = 30):
    transacciones = await transaccion_collection.find({}).limit(limit).to_list(limit)
    trazas = []

    for tx in transacciones:
        # --- Direcciones origen y destino ---
        # 🔥 CORRECCIÓN: Convertir ObjectIds a strings
        origen_ids = tx.get("inputs", [])
        destino_ids = tx.get("outputs", [])
        origen = [str(oid) for oid in origen_ids]
        destino = [str(oid) for oid in destino_ids]
        direccion_ref = origen[0] if origen else (destino[0] if destino else None)

        # --- Información de dirección ---
        direccion_doc = None
        if direccion_ref:
            # si viene como string y es un ObjectId válido, convertir
            if PyObjectId.is_valid(direccion_ref):
                direccion_ref = PyObjectId(direccion_ref)
            direccion_doc = await direccion_collection.find_one({"_id": direccion_ref})
        
        # 🔥 CORRECCIÓN: Manejar el caso donde direccion_doc es None
        perfil_riesgo = "desconocido"
        ultimo_update_riesgo = None
        if direccion_doc:
            perfil_riesgo = direccion_doc.get("perfil_riesgo", "desconocido")
            ultimo_update_riesgo = direccion_doc.get("ultimo_update_riesgo")

        # --- Reportes (ChainAbuse + DB fallback) ---
        try:
            reportes = await fetch_reportes_by_address(direccion_ref) if direccion_ref else []
        except Exception as e:
            print(f"⚠️ Error al obtener reportes para {direccion_ref}: {e}")

            # 🔍 Buscar dirección real si direccion_ref es ObjectId
            direccion_str = None
            if isinstance(direccion_ref, PyObjectId):
                direccion_doc_ref = await direccion_collection.find_one({"_id": direccion_ref})
                if direccion_doc_ref:
                    direccion_str = direccion_doc_ref.get("direccion")

            # ✅ Fallback: buscar en Mongo por dirección (string)
            query_id = direccion_str or direccion_ref
            reportes = await reporte_collection.find({"id_direccion": query_id}).to_list(50)
            print(f"✅ TRAIGO DESDE BD para la dirección {query_id}, reportes={len(reportes)}")

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
            "ultimo_update_riesgo": ultimo_update_riesgo, 
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



async def obtener_trazas_por_direccion(direccion_str: str, saltos: int = 3, limit: int = 20):
    """
    Obtiene o actualiza las trazas de una dirección específica:
    1️⃣ Consulta o crea la dirección en la BD.
    2️⃣ Llama a la API externa (BlockCypher) si no existen transacciones locales.
    3️⃣ Devuelve un resumen de trazas con bloque y reportes asociados.
    """

    # 1️⃣ Buscar la dirección en la BD
    direccion_doc = await direccion_collection.find_one({"direccion": direccion_str})
    if not direccion_doc:
        return {"error": f"No se encontró la dirección {direccion_str}"}

    direccion_id = direccion_doc["_id"]
    direccion_doc["_id"] = str(direccion_id)

    # 2️⃣ Intentar traer transacciones desde la API externa (limitado)
    try:
        print(f"🌐 Buscando nuevas transacciones para {direccion_str}")
        await fetch_and_save_transactions_by_address(direccion_str)
    except Exception as e:
        print(f"⚠️ Error al actualizar transacciones: {e}")

    # 3️⃣ Buscar transacciones locales relacionadas
    transacciones = await transaccion_collection.find({
        "$or": [
            {"inputs": direccion_id},
            {"outputs": direccion_id}
        ]
    }).sort("fecha", -1).limit(limit).to_list(limit)

    # 4️⃣ Obtener reportes ChainAbuse (con fallback a BD)
    try:
        reportes = await fetch_reportes_by_address(direccion_str)
    except Exception as e:
        print(f"⚠️ Error al obtener reportes para {direccion_str}: {e}")
        reportes = await reporte_collection.find({"id_direccion": direccion_str}).to_list(50)
        print(f"✅ TRAIGO DESDE BD para la dirección {direccion_str}, reportes={len(reportes)}")

    categorias_chainabuse = list({r.scamCategory.upper() for r in reportes if hasattr(r, "scamCategory")})
    dominios = list({d for r in reportes for d in getattr(r, "domains", []) if d})
    cantidad_reportes = len(reportes)
    reportes_verificados = len([r for r in reportes if getattr(r, "trusted", False)])
    reportes_no_verificados = cantidad_reportes - reportes_verificados

    # 5️⃣ Armar trazas
    trazas = []
    for tx in transacciones:
        bloque_info = None
        bloque_ref = tx.get("bloque")

        if bloque_ref and PyObjectId.is_valid(bloque_ref):
            bloque_doc = await bloque_collection.find_one({"_id": PyObjectId(bloque_ref)})
            if bloque_doc:
                bloque_info = {
                    "id": str(bloque_doc["_id"]),
                    "numero_bloque": bloque_doc.get("numero_bloque"),
                    "hash": bloque_doc.get("hash"),
                    "fecha": bloque_doc.get("fecha").isoformat() if bloque_doc.get("fecha") else None,
                    "recompensa_total": bloque_doc.get("recompensa_total"),
                    "volumen_total": bloque_doc.get("volumen_total"),
                }

        trazas.append({
            "hash": tx.get("hash"),
            "monto_total": tx.get("monto_total"),
            "estado": tx.get("estado", "desconocido"),
            "bloque": bloque_info,
            "categorias_denuncia": categorias_chainabuse,
        })

    # 6️⃣ Respuesta final estructurada
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
        "trazas": trazas,
        "ultima_actualizacion": datetime.utcnow().isoformat(),
    }
