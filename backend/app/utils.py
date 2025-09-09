# app/utils.py
from app.main import PyObjectId

def direccion_helper(direccion) -> dict:
    return {
        "id": str(direccion["_id"]),  # mapear ObjectId a str
        "direccion": direccion["direccion"],
        "balance": direccion["balance"],
        "total_recibido": direccion["total_recibido"],
        "total_enviado": direccion["total_enviado"],
        "perfil_riesgo": direccion["perfil_riesgo"]
    }

def bloque_helper(bloque) -> dict:
    return {
        "id": str(bloque["_id"]),  # mapear ObjectId a str
        "numero_bloque": bloque["numero_bloque"],
        "hash": bloque["hash"],
        "fecha": str(bloque["fecha"]),  # convertir fecha a string si es necesario
        "recompensa_total": bloque["recompensa_total"],
        "volumen_total": bloque["volumen_total"]
    }

def transaccion_helper(transaccion) -> dict:
    return {
        "id": str(transaccion["_id"]),
        "hash": transaccion["hash"],
        "fecha": transaccion["fecha"].isoformat() if hasattr(transaccion["fecha"], "isoformat") else str(transaccion["fecha"]),
        "inputs": [str(d) for d in transaccion["inputs"]],   # Ajusta según cómo almacenes DireccionModel
        "outputs": [str(d) for d in transaccion["outputs"]], # Ajusta según cómo almacenes DireccionModel
        "monto_total": transaccion["monto_total"],
        "estado": transaccion["estado"],
        "patrones_sospechosos": transaccion.get("patrones_sospechosos", []),
        "bloque": str(transaccion["bloque"]) if transaccion.get("bloque") else None
    }