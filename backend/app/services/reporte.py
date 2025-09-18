import httpx
import base64
from typing import List
from app.database import reporte_collection
from app.models.reporte import Reporte
from datetime import datetime

CHAINABUSE_API_KEY = "ca_QWQ2YkNGVmRBdDY2M3VQV3dLU2RSNFFHLlhCM2U5YjF3V1lrRi80K1hwYVNHbGc9PQ"

async def get_all_reportes() -> List[Reporte]:
    reportes_cursor = reporte_collection.find()
    reportes_list = await reportes_cursor.to_list(length=1000)
    return [Reporte(**reporte) for reporte in reportes_list]

async def fetch_reportes_by_address(address: str) -> List[Reporte]:
    if CHAINABUSE_API_KEY == "YOUR_CHAINABUSE_API_KEY":
        raise ValueError("La API key de ChainAbuse no ha sido configurada.")

    # 1. Buscar primero en la base de datos
    reportes_cursor = reporte_collection.find({"id_direccion": address})
    reportes_list = await reportes_cursor.to_list(length=1000)
    if reportes_list:
        print(f"✅ TRAIGO DESDE BD para la dirección {address}")
        return [Reporte(**reporte) for reporte in reportes_list]

    # 2. Si no existen, consultar la API
    print(f"🌐 TRAIGO DESDE API para la dirección {address}")
    auth_string = f"{CHAINABUSE_API_KEY}:"
    api_key_encoded = base64.b64encode(auth_string.encode()).decode()

    headers = {
        "accept": "application/json",
        "authorization": f"Basic {api_key_encoded}"
    }

    url = f"https://api.chainabuse.com/v0/reports?address={address}&includePrivate=false&page=1&perPage=50"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 404:
                return []
            if response.status_code == 429:
                raise Exception("Has superado el límite de consultas a ChainAbuse. Intenta más tarde.")
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"API request failed with status {e.response.status_code}: {e.response.text}") from e
        except httpx.RequestError as e:
            raise Exception(f"API request failed: {e}") from e

    if "reports" not in data:
        return []

    # 3. Guardar en la base lo que devuelve la API
    saved_reportes = []
    for report_data in data["reports"]:
        chainabuse_id = report_data["id"]

        created_at_str = report_data["createdAt"]
        if created_at_str.endswith('Z'):
            created_at_str = created_at_str[:-1] + '+00:00'

        try:
            created_at_dt = datetime.fromisoformat(created_at_str)
        except ValueError:
            created_at_dt = datetime.now()

        domains = [addr.get("domain") for addr in report_data.get("addresses", []) if addr.get("domain")]

        report_doc = {
            "chainabuse_id": chainabuse_id,
            "id_direccion": address,
            "scamCategory": report_data["scamCategory"],
            "createdAt": created_at_dt,
            "trusted": report_data.get("trusted", False),
            "domains": domains
        }

        result = await reporte_collection.insert_one(report_doc)
        created_report = await reporte_collection.find_one({"_id": result.inserted_id})
        if created_report:
            saved_reportes.append(Reporte(**created_report))

    return saved_reportes
