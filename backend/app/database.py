import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema

# -----------------------------
# Conexión a MongoDB
# -----------------------------

MONGO_DETAILS = os.getenv(
    "MONGO_DETAILS",
    "mongodb://root:root@mongo:27017/trazabilidad?authSource=admin"
)

client = AsyncIOMotorClient(MONGO_DETAILS)
db = client["trazabilidad"]

# Colecciones
direccion_collection = db["direcciones"]
bloque_collection = db["bloques"]
transaccion_collection = db["transacciones"]
reporte_collection = db["reportes"]
cluster_collection = db["clusters"]
analisis_collection = db["analisis"]
relaciones_collection = db["relaciones"]

# -----------------------------
# Clase para usar ObjectId en Pydantic
# -----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler: GetCoreSchemaHandler):
        return core_schema.no_info_wrap_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v),
                info_arg=False,
                return_schema=core_schema.str_schema(),
            ),
        )

    @classmethod
    def validate(cls, v, handler):  # 👈 ahora acepta handler
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

