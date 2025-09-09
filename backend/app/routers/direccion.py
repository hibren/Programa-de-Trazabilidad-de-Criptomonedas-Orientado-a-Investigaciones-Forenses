# app/routers/direccion.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.direccion import DireccionCreateSchema, DireccionResponseSchema, DireccionFetchRequest
from app.services.direccion import (
    create_direccion,
    get_direccion_by_value,
    get_all_direcciones,
    update_direccion,
    delete_direccion,
    fetch_and_save_direccion
)
from app.models.direccion import DireccionModel

router = APIRouter(prefix="/direcciones", tags=["direcciones"])

@router.post("/", response_model=DireccionResponseSchema)
async def create_direccion_endpoint(direccion: DireccionCreateSchema):
    try:
        created = await create_direccion(direccion.model_dump())
        print("CREATED:", created)
        return created
    except Exception as e:
        print(f"Error creating direccion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DireccionResponseSchema])
async def list_direcciones():
    return await get_all_direcciones()

@router.get("/{direccion}", response_model=DireccionResponseSchema)
async def get_direccion(direccion: str):
    try:
        direccion_doc = await get_direccion_by_value(direccion)
        if not direccion_doc:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        print("DIRECCION:", direccion_doc)
        return direccion_doc.dict(by_alias=True)  # 👈 asegurar que JSON tenga "_id"
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting direccion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{direccion_id}", response_model=DireccionResponseSchema)
async def update_direccion_endpoint(direccion_id: str, direccion: DireccionCreateSchema):
    try:
        updated = await update_direccion(direccion_id, direccion.model_dump())
        if not updated:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        print("UPDATED:", updated)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating direccion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{direccion_id}")
async def delete_direccion_endpoint(direccion_id: str):
    try:
        deleted_count = await delete_direccion(direccion_id)
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        return {"detail": "Dirección eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting direccion: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/fetch", response_model=DireccionModel)
async def fetch_direccion(request: DireccionFetchRequest):
    try:
        return await fetch_and_save_direccion(request.direccion)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
