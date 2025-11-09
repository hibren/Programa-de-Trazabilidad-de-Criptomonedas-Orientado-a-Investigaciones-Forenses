from datetime import datetime, timedelta, timezone
from collections import Counter
from app.database import transaccion_collection, patrones_temporales_collection
from app.models.patrones_temporales import PatronTemporalModel, SerieTemporal, CorrelacionPatron

# =========================================================
# 🧠 Función auxiliar: correlación flexible (± margen de horas)
# =========================================================
def calcular_correlacion_flexible(series_a: SerieTemporal, series_b: SerieTemporal, margen_horas: int = 6) -> float:
    """
    Calcula correlación temporal considerando coincidencias dentro de un rango de ±margen_horas.
    Permite detectar comportamientos similares aunque no ocurran exactamente en la misma hora.
    """
    # Convertir las claves (horas) a objetos datetime
    tiempos_a = [datetime.strptime(t, "%Y-%m-%d %H:%M") if ":" in t else datetime.strptime(t, "%Y-%m-%d %H:00") for t in series_a.conteos_por_hora.keys()]
    tiempos_b = [datetime.strptime(t, "%Y-%m-%d %H:%M") if ":" in t else datetime.strptime(t, "%Y-%m-%d %H:00") for t in series_b.conteos_por_hora.keys()]

    coincidencias = 0
    for ta in tiempos_a:
        for tb in tiempos_b:
            diff_horas = abs((ta - tb).total_seconds()) / 3600
            if diff_horas <= margen_horas:
                coincidencias += 1
                break

    total = max(len(tiempos_a), len(tiempos_b))
    correlacion = coincidencias / total if total > 0 else 0
    return round(correlacion, 2)


# =========================================================
# ⚙️ Servicio principal: generar patrones temporales
# =========================================================
async def generar_patrones_temporales(direcciones: list[str], ventana: str = "24h") -> PatronTemporalModel:
    """Analiza patrones temporales entre direcciones y guarda el resultado."""

    print(f"🕒 Analizando patrones temporales | direcciones={direcciones}, ventana={ventana}")

    horas = 24 if ventana == "24h" else 168 if ventana == "7d" else 720
    now = datetime.now(timezone.utc)
    since = now - timedelta(hours=horas)

    # Buscar transacciones recientes asociadas a las direcciones
    txs = await transaccion_collection.find({
        "$and": [
            {"fecha": {"$gte": since}},
            {"$or": [
                {"inputs": {"$in": direcciones}},
                {"outputs": {"$in": direcciones}},
            ]}
        ]
    }).to_list(None)

    print(f"📦 Transacciones encontradas: {len(txs)}")

    # Generar series temporales por dirección
    series = []
    for d in direcciones:
        horas_dir = [
            t["fecha"].strftime("%Y-%m-%d %H:00")
            for t in txs
            if d in t.get("inputs", []) or d in t.get("outputs", [])
        ]
        series.append(SerieTemporal(direccion=d, conteos_por_hora=dict(Counter(horas_dir))))

    # Calcular correlaciones entre pares de direcciones (flexible)
    patrones = []
    for i in range(len(series)):
        for j in range(i + 1, len(series)):
            a, b = series[i], series[j]
            correlacion = calcular_correlacion_flexible(a, b, margen_horas=6)
            if correlacion >= 0.5:
                patrones.append(
                    CorrelacionPatron(
                        grupo=[a.direccion, b.direccion],
                        correlacion=correlacion
                    )
                )

    # Crear documento a guardar
    doc = PatronTemporalModel(
        direcciones=direcciones,
        ventana=ventana,
        total_txs=len(txs),
        series=series,
        patrones=patrones,
        fecha_analisis=now,
    )

    # 🧩 Corregido: eliminar _id si está None
    data = doc.dict(by_alias=True)
    if data.get("_id") is None:
        data.pop("_id")

    result = await patrones_temporales_collection.insert_one(data)
    doc.id = str(result.inserted_id)

    print(f"💾 Patrones temporales guardados con ID: {doc.id}")
    print(f"🔍 Patrones detectados: {len(patrones)}")
    if patrones:
        for p in patrones:
            print(f" → {p.grupo} | correlación={p.correlacion}")

    return doc
