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
    # 0️⃣ Buscar primero si ya existe en la BD
    analisis_existente = await analisis_collection.find_one({"cluster.direccion": address})
    if analisis_existente:
        print(f"✅ Análisis encontrado en BD para {address}")
        analisis_existente["_id"] = str(analisis_existente["_id"])
        return AnalisisModel(**analisis_existente)

    print(f"🧩 Generando nuevo análisis para {address}...")

    # 1️⃣ Buscar cluster
    cluster = await get_cluster_by_address(address)
    if not cluster:
        cluster = await fetch_and_save_cluster(address)
    if not cluster:
        return None

    # 2️⃣ Buscar reportes (desde BD o API)
    reportes = []
    for dir_ in cluster.direccion:
        r = await fetch_reportes_by_address(dir_)
        reportes.extend(r)

    # 3️⃣ Calcular riesgo
    categorias = [rep.scamCategory for rep in reportes]
    if "RANSOMWARE" in categorias or "FAKE_RETURNS" in categorias:
        riesgo = "Alto"
    elif categorias:
        riesgo = "Medio"
    else:
        riesgo = "Bajo"

    # 4️⃣ Construir documento
    analisis_doc = {
        "cluster": cluster.dict(by_alias=True),
        "reportes": [Reporte(**r.dict(by_alias=True)).dict(by_alias=True) for r in reportes],
        "riesgo": riesgo,
        "descripcion": f"Análisis generado para {address} con {len(reportes)} reportes",
        "createdAt": datetime.utcnow()
    }

    # 5️⃣ Guardar en BD
    result = await analisis_collection.insert_one(analisis_doc)
    analisis_doc["_id"] = str(result.inserted_id)

    print(f"💾 Análisis guardado en BD para {address}")

    # 6️⃣ Devolver modelo
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
    Analiza una dirección específica o todas las direcciones.
    Combina reportes, actividad reciente y categorías delictivas.
    Actualiza la colección `direccion_collection` con el estado actual del riesgo
    y genera alertas automáticas si el riesgo es ALTO o CRÍTICO.
    """
    print("\n" + "=" * 60)
    print("🚀 INICIANDO ANÁLISIS DE RIESGO")
    print("=" * 60)

    # QUERY
    query = {"direccion": direccion} if direccion else {}
    print(f"📍 Query: {query}")

    direcciones = await direccion_collection.find(query).to_list(None)
    print(f"🔍 Analizando {len(direcciones)} dirección(es)...")
    resultados = []

    for dir_doc in direcciones:
        addr = dir_doc["direccion"]
        doc_id = dir_doc["_id"]

        print(f"\n{'=' * 60}")
        print(f"📌 DIRECCIÓN: {addr}")
        print(f"🆔 ObjectId: {doc_id} (tipo: {type(doc_id)})")
        print(f"{'=' * 60}")

        # --- Reportes asociados ---
        reportes = await reporte_collection.find({"id_direccion": addr}).to_list(None)
        print(f"📄 Reportes encontrados: {len(reportes)}")
        if reportes:
            print(f"🧾 Categorías: {[r.get('scamCategory', 'OTHER') for r in reportes]}")

        categorias = [r.get("scamCategory", "OTHER") for r in reportes]

        # --- Actividad: DB o API ---
        ultima_tx = dir_doc.get("ultima_tx")
        print(f"🕐 ultima_tx en DB: {ultima_tx} (tipo: {type(ultima_tx)})")

        if not ultima_tx:
            api_tx = await verificar_actividad_blockcypher(addr)
            if api_tx:
                ultima_tx = api_tx
                print(f"✅ TX desde BlockCypher: {ultima_tx}")
            else:
                print(f"❌ Sin TX en BlockCypher")
        else:
            api_tx = await verificar_actividad_blockcypher(addr)
            if api_tx:
                ultima_tx = api_tx
                print(f"🔄 TX actualizada desde BlockCypher: {ultima_tx}")

        # --- Cálculo de riesgo ---
        resultado = calcular_perfil_riesgo(len(reportes), categorias, ultima_tx)

        # --- Conversión de fecha a string ISO ---
        ultima_tx_iso = None
        if ultima_tx:
            if isinstance(ultima_tx, datetime):
                ultima_tx_iso = ultima_tx.isoformat()
            else:
                ultima_tx_iso = str(ultima_tx)
            print(f"📅 ultima_tx_iso: {ultima_tx_iso}")

        # --- Preparar datos para actualización ---
        update_data = {
            "perfil_riesgo": resultado["nivel"],
            "ultimo_update_riesgo": datetime.now(timezone.utc).isoformat(),
            "total": resultado["total"],
            "cantidad_reportes": len(reportes),
            "actividad": resultado["actividad"],
            "categorias": categorias,
            "ponderaciones": resultado["ponderaciones"],
        }

        if ultima_tx_iso:
            update_data["ultima_tx"] = ultima_tx_iso

        print(f"\n💾 ACTUALIZACIÓN:")
        print(f"   Query: {{'_id': {doc_id}}}")
        print(f"   Datos a actualizar:")
        for key, val in update_data.items():
            print(f"      - {key}: {val}")

        try:
            # --- Actualización en direccion_collection ---
            update_result = await direccion_collection.update_one(
                {"_id": doc_id},
                {"$set": update_data}
            )

            print(f"\n📊 RESULTADO DE UPDATE:")
            print(f"   ✓ Matched: {update_result.matched_count}")
            print(f"   ✓ Modified: {update_result.modified_count}")
            print(f"   ✓ Acknowledged: {update_result.acknowledged}")

            actualizado = update_result.modified_count > 0

            # ------------------------------------------------------------
            # 🚨 GENERAR ALERTA AUTOMÁTICA SI RIESGO ES ALTO O CRÍTICO
            # ------------------------------------------------------------
            try:
                from app.services.alerta import generar_alerta_por_riesgo
                from app.database import db

                nivel = update_data.get("perfil_riesgo", "").lower()
                if nivel in ["alto", "crítico"]:
                    print(f"🚨 Nivel {nivel.upper()} detectado para {addr}, generando alerta...")
                    await generar_alerta_por_riesgo(db, str(doc_id), nivel.capitalize())
                else:
                    print(f"ℹ️ Riesgo {nivel} → no se genera alerta para {addr}")

            except Exception as e:
                print(f"❌ Error generando alerta automática para {addr}: {e}")

        except Exception as e:
            print(f"   ❌ ERROR EN UPDATE: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            actualizado = False

        # --- Registro histórico en colección analisis ---
        try:
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

            insert_result = await analisis_collection.insert_one(analisis_doc)
            print(f"📝 Análisis guardado con ID: {insert_result.inserted_id}")
        except Exception as e:
            print(f"❌ ERROR guardando análisis: {e}")

        resultados.append({
            "direccion": addr,
            "nivel": resultado["nivel"],
            "total": resultado["total"],
            "cantidad_reportes": len(reportes),
            "categorias": categorias,
            "actividad": resultado["actividad"],
            "ponderaciones": resultado["ponderaciones"],
            "fecha_analisis": datetime.now(timezone.utc).isoformat(),
            "actualizado": actualizado
        })

    print(f"\n{'=' * 60}")
    print(f"🏁 ANÁLISIS COMPLETADO")
    print(f"   Direcciones analizadas: {len(resultados)}")
    print(f"   Direcciones actualizadas: {sum(1 for r in resultados if r['actualizado'])}")
    print(f"{'=' * 60}\n")

    return {"analizadas": len(resultados), "resultados": resultados}
