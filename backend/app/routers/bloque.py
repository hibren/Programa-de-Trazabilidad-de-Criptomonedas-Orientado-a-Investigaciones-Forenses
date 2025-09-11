from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.bloque import BloqueCreateSchema, BloqueResponseSchema, BloqueFetchRequest
from app.services.bloque import (
    create_bloque,
    get_bloque_by_hash,
    get_all_bloques,
    update_bloque,
    delete_bloque,
    fetch_and_save_bloque
)
from app.models.bloque import BloqueModel

router = APIRouter(prefix="/bloques", tags=["bloques"])

@router.post("/", response_model=BloqueResponseSchema)
async def create_bloque_endpoint(bloque: BloqueCreateSchema):
    try:
        created = await create_bloque(bloque.model_dump())
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[BloqueResponseSchema])
async def list_bloques():
    return await get_all_bloques()

@router.get("/{bloque_hash}", response_model=BloqueResponseSchema)
async def get_bloque(bloque_hash: str):
    try:
        bloque_doc = await get_bloque_by_hash(bloque_hash)
        if not bloque_doc:
            raise HTTPException(status_code=404, detail="Bloque no encontrado")
        return bloque_doc.dict(by_alias=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{bloque_id}", response_model=BloqueResponseSchema)
async def update_bloque_endpoint(bloque_id: str, bloque: BloqueCreateSchema):
    try:
        updated = await update_bloque(bloque_id, bloque.model_dump())
        if not updated:
            raise HTTPException(status_code=404, detail="Bloque no encontrado")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bloque_id}")
async def delete_bloque_endpoint(bloque_id: str):
    try:
        deleted_count = await delete_bloque(bloque_id)
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bloque no encontrado")
        return {"detail": "Bloque eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/fetch", response_model=BloqueModel)
async def fetch_bloque(request: BloqueFetchRequest):
    try:
        return await fetch_and_save_bloque(request.hash)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
