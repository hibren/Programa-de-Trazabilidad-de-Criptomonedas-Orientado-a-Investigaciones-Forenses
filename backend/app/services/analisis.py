from app.database import analisis_collection, direccion_collection, reporte_collection
from app.services.cluster import get_cluster_by_address, fetch_and_save_cluster
from app.services.reporte import fetch_reportes_by_address
from app.models.analisis import AnalisisModel
from app.schemas.reporte import Reporte
from datetime import datetime, timezone, timedelta
from typing import Optional
from bson import ObjectId
import httpx

PESOS_CATEGORIAS = {
    "RANSOMWARE": 3,
    "FAKE_RETURNS": 2,
    "SCAM": 2,
    "PHISHING": 1,
    "OTHER": 0.5,
}


async def get_all_analisis():
    docs = await analisis_collection.find().to_list(100)
    # devolvemos tal cual los documentos para no romper con modelos distintos
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs


async def generar_analisis_por_direccion(address: str) -> Optional[AnalisisModel]:
    cluster = await get_cluster_by_address(address)
    if not cluster:
        cluster = await fetch_and_save_cluster(address)
    if not cluster:
        return None

    reportes = []
    for dir_ in cluster.direccion:
        r = await fetch_reportes_by_address(dir_)
        reportes.extend(r)

    categorias = [rep.scamCategory for rep in reportes]
    if "RANSOMWARE" in categorias or "FAKE_RETURNS" in categorias:
        riesgo = "Alto"
    elif categorias:
        riesgo = "Medio"
    else:
        riesgo = "Bajo"

    analisis_doc = {
        "cluster": cluster.dict(by_alias=True),
        "reportes": [Reporte(**r.dict(by_alias=True)).dict(by_alias=True) for r in reportes],
        "riesgo": riesgo,
        "descripcion": f"Análisis generado para {address} con {len(reportes)} reportes",
        "createdAt": datetime.utcnow()
    }

    result = await analisis_collection.insert_one(analisis_doc)
    analisis_doc["_id"] = str(result.inserted_id)

    return AnalisisModel(**analisis_doc)


async def verificar_actividad_blockcypher(direccion: str):
    """Consulta a BlockCypher para obtener la fecha de la última transacción."""
    url = f"https://api.blockcypher.com/v1/btc/main/addrs/{direccion}"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, timeout=10)
            if r.status_code != 200:
                return None
            data = r.json()
            last_tx = data.get("final_tx_time")
            if last_tx:
                # Convierte a datetime con timezone UTC
                if isinstance(last_tx, str):
                    if last_tx.endswith("Z"):
                        last_tx = last_tx.replace("Z", "+00:00")
                    return datetime.fromisoformat(last_tx)
                return last_tx
            return None
    except Exception as e:
        print(f"⚠️ Error consultando BlockCypher para {direccion}: {e}")
        return None


def _parse_datetime(dt_value: any) -> Optional[datetime]:
    """
    Convierte cualquier formato de datetime a datetime con timezone UTC.
    Maneja: strings ISO, datetime objects, None, etc.
    """
    if not dt_value:
        return None

    try:
        # Si es string
        if isinstance(dt_value, str):
            # Reemplaza Z por +00:00 si está en formato ISO con Z
            if dt_value.endswith("Z"):
                dt_value = dt_value.replace("Z", "+00:00")
            dt_parsed = datetime.fromisoformat(dt_value)
        else:
            # Si ya es datetime
            dt_parsed = dt_value

        # Asegúrate que tenga timezone UTC
        if dt_parsed.tzinfo is None:
            dt_parsed = dt_parsed.replace(tzinfo=timezone.utc)
        else:
            dt_parsed = dt_parsed.astimezone(timezone.utc)

        return dt_parsed
    except Exception as e:
        print(f"⚠️ Error parseando datetime '{dt_value}': {e}")
        return None


def calcular_perfil_riesgo(num_reportes, categorias, ultima_tx: Optional[datetime]):
    """Calcula el puntaje total y nivel de riesgo."""
    print(f"➡️ Calculando riesgo | Reportes: {num_reportes}, Categorías: {categorias}, Última TX: {ultima_tx}")

    # --- Reportes ---
    if num_reportes == 0:
        score_reportes = 0
    elif num_reportes == 1:
        score_reportes = 1
    elif num_reportes <= 3:
        score_reportes = 2
    else:
        score_reportes = 3

    # --- Categorías ---
    score_categoria = max([PESOS_CATEGORIAS.get(c.upper(), 0) for c in categorias]) if categorias else 0

    # --- Actividad ---
    ahora = datetime.now(timezone.utc)
    actividad = "sin transacciones"
    score_actividad = 0

    if ultima_tx:
        # Parsea la fecha correctamente
        ultima_tx_parsed = _parse_datetime(ultima_tx)

        if ultima_tx_parsed:
            try:
                diff = ahora - ultima_tx_parsed
                if diff <= timedelta(days=90):
                    score_actividad = 3
                    actividad = "reciente"
                elif diff <= timedelta(days=365):
                    score_actividad = 2
                    actividad = "media"
                else:
                    score_actividad = 1
                    actividad = "inactiva"
            except Exception as e:
                print(f"⚠️ Error calculando diferencia de fechas: {e}")
                actividad = "sin transacciones"
                score_actividad = 0

    total = score_reportes + score_categoria + score_actividad

    if total <= 2:
        nivel = "bajo"
    elif total <= 4:
        nivel = "medio"
    elif total <= 6:
        nivel = "alto"
    else:
        nivel = "crítico"

    print(f"📊 Ponderaciones → reportes={score_reportes}, categoria={score_categoria}, actividad={score_actividad}, total={total}, nivel={nivel}")

    return {
        "total": total,
        "nivel": nivel,
        "ponderaciones": {
            "reportes": score_reportes,
            "categorias": score_categoria,
            "actividad": score_actividad
        },
        "actividad": actividad
    }


async def analizar_riesgo_direcciones(direccion: Optional[str] = None):
    """
    Analiza una dirección específica o todas las direcciones activas.
    Combina reportes, actividad reciente y categorías delictivas.
    """
    query = {"direccion": direccion} if direccion else {"ultima_tx": {"$ne": None}}
    direcciones = await direccion_collection.find(query).to_list(None)
    print(f"🔍 Analizando {len(direcciones)} dirección(es)...")
    resultados = []

    for dir_doc in direcciones:
        addr = dir_doc["direccion"]
        print(f"\n==============================")
        print(f"📌 Analizando dirección: {addr}")
        print(f"🔍 DEBUG - dir_doc completo: {dir_doc}")

        # --- Reportes asociados ---
        reportes = await reporte_collection.find({"id_direccion": addr}).to_list(None)
        print(f"📄 Reportes encontrados: {len(reportes)}")
        if reportes:
            print(f"🧾 Categorías encontradas: {[r.get('scamCategory', 'OTHER') for r in reportes]}")

        categorias = [r.get("scamCategory", "OTHER") for r in reportes]

        # --- Actividad: DB o API ---
        ultima_tx = dir_doc.get("ultima_tx")
        print(f"🔍 DEBUG - ultima_tx del documento: {ultima_tx}, tipo: {type(ultima_tx)}")

        # Si no hay transacción en DB, consulta BlockCypher
        if not ultima_tx:
            api_tx = await verificar_actividad_blockcypher(addr)
            if api_tx:
                ultima_tx = api_tx
                print(f"🔗 Última transacción detectada desde BlockCypher: {ultima_tx}")
            else:
                print(f"🔸 Sin actividad detectada en API ni en base de datos")
        else:
            # Si hay valor en DB, opcionalmente valida/actualiza con API
            api_tx = await verificar_actividad_blockcypher(addr)
            if api_tx:
                ultima_tx = api_tx
                print(f"🔗 Última transacción actualizada desde BlockCypher: {ultima_tx}")
            else:
                print(f"🔸 API sin respuesta. Usando valor local: {ultima_tx}")

        # --- Cálculo de riesgo ---
        resultado = calcular_perfil_riesgo(len(reportes), categorias, ultima_tx)

        # --- Actualización de dirección ---
        # Convierte ultima_tx a ISO string si es datetime
        ultima_tx_iso = None
        if ultima_tx:
            if isinstance(ultima_tx, datetime):
                ultima_tx_iso = ultima_tx.isoformat()
            else:
                ultima_tx_iso = str(ultima_tx)

        await direccion_collection.update_one(
            {"_id": ObjectId(dir_doc["_id"])},
            {"$set": {
                "perfil_riesgo": resultado["nivel"],
                "ultimo_update_riesgo": datetime.now(timezone.utc).isoformat(),
                "ultima_tx": ultima_tx_iso
            }}
        )
        print(f"✅ Dirección actualizada con perfil_riesgo='{resultado['nivel']}'")

        # --- Registro del análisis ---
        analisis_doc = {
            "direccion": addr,
            "puntaje_total": resultado["total"],
            "nivel_riesgo": resultado["nivel"],
            "factores": {
                "reportes": len(reportes),
                "categorias": categorias,
                "actividad": resultado["actividad"],
                "ponderaciones": resultado["ponderaciones"]
            },
            "fecha_analisis": datetime.now(timezone.utc).isoformat()
        }
        await analisis_collection.insert_one(analisis_doc)
        print(f"📝 Análisis guardado en colección 'analisis' con nivel '{resultado['nivel']}' y total {resultado['total']}")

        resultados.append({
            "direccion": addr,
            "nivel": resultado["nivel"],
            "total": resultado["total"],
            "cantidad_reportes": len(reportes),
            "categorias": categorias,
            "actividad": resultado["actividad"],
            "ponderaciones": resultado["ponderaciones"],
            "fecha_analisis": datetime.now(timezone.utc).isoformat()
        })

    print(f"\n🏁 Análisis completado. Direcciones analizadas: {len(resultados)}")
    return {"analizadas": len(resultados), "resultados": resultados}