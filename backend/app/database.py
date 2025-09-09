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

# -----------------------------
# Clase para usar ObjectId en Pydantic
# -----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler: GetCoreSchemaHandler):
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema()
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, _handler):
        # cómo mostrarlo en OpenAPI/Swagger
        schema.update(type="string")
        return schema
