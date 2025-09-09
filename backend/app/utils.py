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
