from app.database import db, PyObjectId
from bson import ObjectId

direccion_collection = db["direcciones"]

async def create_direccion(data: dict):
    result = await direccion_collection.insert_one(data)
    return await direccion_collection.find_one({"_id": result.inserted_id})

async def get_direccion_by_id(direccion_id: str):
    return await direccion_collection.find_one({"_id": ObjectId(direccion_id)})

async def get_all_direcciones():
    return await direccion_collection.find().to_list(length=100)  # limita a 100 por ejemplo

async def update_direccion(direccion_id: str, data: dict):
    await direccion_collection.update_one({"_id": ObjectId(direccion_id)}, {"$set": data})
    return await get_direccion_by_id(direccion_id)

async def delete_direccion(direccion_id: str):
    result = await direccion_collection.delete_one({"_id": ObjectId(direccion_id)})
    return result.deleted_count
