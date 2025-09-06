from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# Conexión a Mongo
client = AsyncIOMotorClient("mongodb://localhost:27023")
db = client["trazabilidad"]

@app.get("/")
async def read_root():
    return {"mensaje": "Hola desde FastAPI 🚀"}

@app.get("/usuarios")
async def get_users():
    usuarios = await db.usuarios.find().to_list(100)
    return usuarios
