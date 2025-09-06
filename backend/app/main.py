from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from bson.json_util import dumps
from fastapi.responses import JSONResponse

app = FastAPI()

# Conexión a Mongo
client = AsyncIOMotorClient("mongodb://localhost:27023")
db = client["trazabilidad"]

@app.get("/")
async def read_root():
    return {"mensaje": "Hola desde FastAPI 🚀"}

@app.get("/transacciones/{transaccion_id}")
async def get_transaccion(transaccion_id: str):
    transaccion = await db.transacciones.find_one({"_id": ObjectId(transaccion_id)})
    if transaccion:
        # bson no es JSON nativo, usamos dumps para convertir
        return JSONResponse(content=dumps(transaccion))
    return {"error": "Transacción no encontrada"}
