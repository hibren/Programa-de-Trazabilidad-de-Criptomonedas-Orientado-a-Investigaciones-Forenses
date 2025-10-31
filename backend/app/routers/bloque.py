from fastapi import APIRouter, HTTPException, Depends
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
from app.security import check_permissions_auto
from app.models.usuario import Usuario

router = APIRouter(prefix="/bloques", tags=["bloques"])

@router.post("/", response_model=BloqueResponseSchema)
async def create_bloque_endpoint(bloque: BloqueCreateSchema, current_user: Usuario = Depends(check_permissions_auto)):
    try:
        created = await create_bloque(bloque.model_dump())
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[BloqueResponseSchema])
async def list_bloques():  # 👈 quitá el Depends(check_permissions_auto)
    bloques = await get_all_bloques()
    return [b.model_dump(by_alias=True) for b in bloques]

@router.get("/{bloque_hash}", response_model=BloqueResponseSchema)
async def get_bloque(bloque_hash: str, current_user: Usuario = Depends(check_permissions_auto)):
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
async def update_bloque_endpoint(bloque_id: str, bloque: BloqueCreateSchema, current_user: Usuario = Depends(check_permissions_auto)):
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
async def delete_bloque_endpoint(bloque_id: str, current_user: Usuario = Depends(check_permissions_auto)):
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
async def fetch_bloque(request: BloqueFetchRequest, current_user: Usuario = Depends(check_permissions_auto)):
    try:
        return await fetch_and_save_bloque(request.hash)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
