from typing import List, Optional
import httpx
from datetime import datetime
from app.database import transaccion_collection, PyObjectId
from app.models.transaccion import TransaccionModel
from app.schemas.transaccion import TransaccionCreateSchema
from app.services.direccion import fetch_and_save_direccion
from app.services.bloque import fetch_and_save_bloque

async def get_all_transacciones() -> List[TransaccionModel]:
    docs = await transaccion_collection.find().to_list(100)
    return [TransaccionModel(**doc) for doc in docs]

async def create_transaccion(data: TransaccionCreateSchema) -> TransaccionModel:
    # Resolve inputs and outputs to get their ObjectIds
    inputs_ids = [
        (await fetch_and_save_direccion(addr)).id for addr in data.inputs
    ]
    outputs_ids = [
        (await fetch_and_save_direccion(addr)).id for addr in data.outputs
    ]

    transaccion_doc = {
        "hash": data.hash,
        "fecha": data.fecha,
        "inputs": inputs_ids,
        "outputs": outputs_ids,
        "monto_total": data.monto_total,
        "estado": data.estado,
        "patrones_sospechosos": data.patrones_sospechosos,
        "bloque": PyObjectId(data.bloque) if data.bloque and PyObjectId.is_valid(data.bloque) else None,
    }

    result = await transaccion_collection.insert_one(transaccion_doc)
    created = await transaccion_collection.find_one({"_id": result.inserted_id})
    return TransaccionModel(**created)

async def get_transaccion_by_hash(hash_str: str) -> Optional[TransaccionModel]:
    doc = await transaccion_collection.find_one({"hash": hash_str})
    return TransaccionModel(**doc) if doc else None

async def update_transaccion(transaccion_id: str, data: dict) -> Optional[TransaccionModel]:
    await transaccion_collection.update_one(
        {"_id": PyObjectId(transaccion_id)}, {"$set": data}
    )
    updated = await transaccion_collection.find_one({"_id": PyObjectId(transaccion_id)})
    return TransaccionModel(**updated) if updated else None

async def delete_transaccion(transaccion_id: str) -> int:
    result = await transaccion_collection.delete_one({"_id": PyObjectId(transaccion_id)})
    return result.deleted_count

async def _fetch_raw_transactions_by_address(address: str, limit: int = 10) -> List[dict]:
    url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}/full?limit={limit}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            try:
                data = response.json()
            except ValueError:
                raise ValueError("La respuesta de la API no es JSON válido")

            if "error" in data:
                raise ValueError(data["error"])
        except httpx.HTTPStatusError as e:
            raise Exception(f"Error HTTP: {e.response.text}") from e
        except httpx.RequestError as e:
            raise Exception(f"Error de conexión con la API: {str(e)}") from e

    if "txs" in data:
        return data["txs"]
    else:
        return []

async def fetch_and_save_transactions_by_address(address: str) -> List[TransaccionModel]:
    raw_txs = await _fetch_raw_transactions_by_address(address)
    saved_transactions = []

    for tx_data in raw_txs:
        tx_hash = tx_data.get("hash")
        if not tx_hash:
            continue

        existing_tx = await get_transaccion_by_hash(tx_hash)
        if existing_tx:
            saved_transactions.append(existing_tx)
            continue

        # Bloque asociado
        block_id = None
        block_hash = tx_data.get("block_hash")
        if block_hash:
            bloque = await fetch_and_save_bloque(block_hash)
            if bloque:
                block_id = bloque.id

        # Inputs
        input_ids = []
        for vin in tx_data.get("inputs", []):
            for addr in vin.get("addresses", []):
                if addr:
                    direccion = await fetch_and_save_direccion(addr)
                    input_ids.append(direccion.id)

        # Outputs
        output_ids = []
        for vout in tx_data.get("outputs", []):
            for addr in vout.get("addresses", []):
                if addr:
                    direccion = await fetch_and_save_direccion(addr)
                    output_ids.append(direccion.id)

        # Fecha
        fecha_str = tx_data.get("confirmed")
        fecha_obj = datetime.fromisoformat(fecha_str.replace("Z", "+00:00")) if fecha_str else datetime.now()

        # Crear documento de transacción
        transaccion_doc = {
            "hash": tx_hash,
            "fecha": fecha_obj,
            "inputs": input_ids,
            "outputs": output_ids,
            "monto_total": float(tx_data.get("total", 0)) / 100000000,  # satoshis → BTC
            "estado": "confirmada" if tx_data.get("block_height", -1) > 0 else "pendiente",
            "patrones_sospechosos": [],
            "bloque": block_id,
            "fees": float(tx_data.get("fees", 0)) / 100000000,  # satoshis → BTC
            "confirmations": int(tx_data.get("confirmations", 0)),
        }

        # Guardar en Mongo
        result = await transaccion_collection.insert_one(transaccion_doc)
        created = await transaccion_collection.find_one({"_id": result.inserted_id})
        if created:
            saved_transactions.append(TransaccionModel(**created))

    return saved_transactions


async def fetch_transactions_by_address(address: str) -> List[dict]:
    await fetch_and_save_transactions_by_address(address)
    return await _fetch_raw_transactions_by_address(address)

#obtener las transacciones desde la bd 
async def get_transacciones_by_direccion(direccion_id: str) -> List[TransaccionModel]:
    direccion_obj_id = PyObjectId(direccion_id)

    cursor = transaccion_collection.find({
        "$or": [
            {"inputs": direccion_obj_id},
            {"outputs": direccion_obj_id}
        ]
    })

    docs = await cursor.to_list(100)
    return [TransaccionModel(**doc) for doc in docs]