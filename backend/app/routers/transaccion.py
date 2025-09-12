from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.transaccion import TransaccionCreateSchema, TransaccionResponseSchema, TransaccionFetchRequest
from app.services.transaccion import (
    create_transaccion,
    get_transaccion_by_hash,
    get_all_transacciones,
    update_transaccion,
    delete_transaccion,
    fetch_and_save_transactions_by_address,
)

router = APIRouter(prefix="/transacciones", tags=["transacciones"])

@router.post("/", response_model=TransaccionResponseSchema)
async def create_transaccion_endpoint(transaccion: TransaccionCreateSchema):
    try:
        created = await create_transaccion(transaccion)
        return created.model_dump(by_alias=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[TransaccionResponseSchema])
async def list_transacciones():
    transacciones = await get_all_transacciones()
    return [t.model_dump(by_alias=True) for t in transacciones]

@router.get("/{transaccion_hash}", response_model=TransaccionResponseSchema)
async def get_transaccion(transaccion_hash: str):
    try:
        transaccion_doc = await get_transaccion_by_hash(transaccion_hash)
        if not transaccion_doc:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        return transaccion_doc.model_dump(by_alias=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{transaccion_id}", response_model=TransaccionResponseSchema)
async def update_transaccion_endpoint(transaccion_id: str, transaccion: TransaccionCreateSchema):
    try:
        updated = await update_transaccion(transaccion_id, transaccion.model_dump())
        if not updated:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        return updated.model_dump(by_alias=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{transaccion_id}")
async def delete_transaccion_endpoint(transaccion_id: str):
    try:
        deleted_count = await delete_transaccion(transaccion_id)
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        return {"detail": "Transacción eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/fetch", response_model=List[TransaccionResponseSchema])
async def fetch_transacciones_by_direccion(direccion_hash: str):
    try:
        transacciones = await fetch_and_save_transactions_by_address(direccion_hash)
        return [t.model_dump(by_alias=True) for t in transacciones]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))