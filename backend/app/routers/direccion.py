# app/routers/direccion.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.direccion import DireccionCreateSchema, DireccionResponseSchema
from app.services.direccion import (
    create_direccion,
    get_direccion_by_id,
    get_all_direcciones,
    update_direccion,
    delete_direccion
)

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

@router.get("/{direccion_id}", response_model=DireccionResponseSchema)
async def get_direccion(direccion_id: str):
    try:
        direccion = await get_direccion_by_id(direccion_id)
        if not direccion:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        print("DIRECCION:", direccion)
        return direccion
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