from datetime import datetime, timezone
from app.database import rastreo_collection
from app.services.transaccion import fetch_and_save_transactions_by_address, get_all_transacciones
from app.models.transaccion import TransaccionModel


# ================================================================
# 🔹 RASTREO DE ORIGEN — Hacia atrás en la cadena
# ================================================================
async def rastrear_origen(direccion_inicial: str, profundidad: int = 3):
    """
    Rastrear el origen de los fondos hacia atrás desde una dirección.
    Usa las transacciones almacenadas o las obtiene automáticamente desde la API externa.
    """
    print(f"\n🚀 [RASTREO DE ORIGEN] {direccion_inicial} | profundidad={profundidad}")

    # 1️⃣ Revisar si ya existe en Mongo
    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "origen"
    })
    if existente:
        print(f"📂 Rastreo existente → devolviendo desde Mongo")
        existente["_id"] = str(existente["_id"])
        return existente

    # 2️⃣ Actualizar o traer transacciones
    await fetch_and_save_transactions_by_address(direccion_inicial)
    txs = await get_all_transacciones()

    resultados = []
    visitadas = set()
    direcciones_a_buscar = [direccion_inicial]

    for nivel in range(profundidad):
        nuevas_direcciones = set()
        for dir_actual in direcciones_a_buscar:
            if dir_actual in visitadas:
                continue

            for tx in txs:
                outputs = tx.outputs if isinstance(tx, TransaccionModel) else tx.get("outputs", [])
                inputs = tx.inputs if isinstance(tx, TransaccionModel) else tx.get("inputs", [])

                # Si esta dirección está entre los outputs (es decir, fue destinataria)
                if dir_actual in outputs:
                    for entrada in inputs:
                        nuevas_direcciones.add(entrada)
                        resultados.append({
                            "nivel": nivel + 1,
                            "desde": entrada,
                            "hacia": dir_actual,
                            "monto": getattr(tx, "monto_total", tx.get("monto_total", 0)),
                            "hash": getattr(tx, "hash", tx.get("hash")),
                            "estado": getattr(tx, "estado", tx.get("estado", "desconocido")),
                            "fecha": getattr(tx, "fecha", tx.get("fecha", datetime.now())),
                        })

            visitadas.add(dir_actual)

        direcciones_a_buscar = list(nuevas_direcciones)
        if not direcciones_a_buscar:
            break

        # Consultar más direcciones si aparecen nuevas
        for nueva_dir in direcciones_a_buscar:
            await fetch_and_save_transactions_by_address(nueva_dir)

    # 3️⃣ Guardar rastreo
    doc = {
        "direccion_inicial": direccion_inicial,
        "tipo": "origen",
        "resultado": resultados,
        "total_conexiones": len(resultados),
        "fecha_analisis": datetime.now(timezone.utc).isoformat(),
    }

    if resultados:
        await rastreo_collection.insert_one(doc)
        print(f"💾 Rastreo ORIGEN guardado ({len(resultados)} conexiones)")
    else:
        print(f"⚠️ No se encontraron transacciones previas para {direccion_inicial}")

    return doc


# ================================================================
# 🔹 RASTREO DE DESTINO — Hacia adelante en la cadena
# ================================================================
async def rastrear_destino(direccion_inicial: str, profundidad: int = 3):
    """
    Rastrear hacia dónde se dirigen los fondos desde una dirección origen.
    Analiza los outputs de las transacciones salientes y sigue el flujo.
    """
    print(f"\n🚀 [RASTREO DE DESTINO] {direccion_inicial} | profundidad={profundidad}")

    # 1️⃣ Revisar si ya existe
    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "destino"
    })
    if existente:
        print(f"📂 Rastreo existente → devolviendo desde Mongo")
        existente["_id"] = str(existente["_id"])
        return existente

    # 2️⃣ Actualizar o traer transacciones
    await fetch_and_save_transactions_by_address(direccion_inicial)
    txs = await get_all_transacciones()

    resultados = []
    visitadas = set()
    direcciones_a_buscar = [direccion_inicial]

    for nivel in range(profundidad):
        nuevas_direcciones = set()
        for dir_actual in direcciones_a_buscar:
            if dir_actual in visitadas:
                continue

            for tx in txs:
                inputs = tx.inputs if isinstance(tx, TransaccionModel) else tx.get("inputs", [])
                outputs = tx.outputs if isinstance(tx, TransaccionModel) else tx.get("outputs", [])

                # Si esta dirección está entre los inputs (es decir, fue emisora)
                if dir_actual in inputs:
                    for salida in outputs:
                        nuevas_direcciones.add(salida)
                        resultados.append({
                            "nivel": nivel + 1,
                            "desde": dir_actual,
                            "hacia": salida,
                            "monto": getattr(tx, "monto_total", tx.get("monto_total", 0)),
                            "hash": getattr(tx, "hash", tx.get("hash")),
                            "estado": getattr(tx, "estado", tx.get("estado", "desconocido")),
                            "fecha": getattr(tx, "fecha", tx.get("fecha", datetime.now())),
                        })

            visitadas.add(dir_actual)

        direcciones_a_buscar = list(nuevas_direcciones)
        if not direcciones_a_buscar:
            break

        # Consultar nuevas direcciones
        for nueva_dir in direcciones_a_buscar:
            await fetch_and_save_transactions_by_address(nueva_dir)

    # 3️⃣ Guardar rastreo
    doc = {
        "direccion_inicial": direccion_inicial,
        "tipo": "destino",
        "resultado": resultados,
        "total_conexiones": len(resultados),
        "fecha_analisis": datetime.now(timezone.utc).isoformat(),
    }

    if resultados:
        await rastreo_collection.insert_one(doc)
        print(f"💾 Rastreo DESTINO guardado ({len(resultados)} conexiones)")
    else:
        print(f"⚠️ No se encontraron transacciones posteriores para {direccion_inicial}")

    return doc


# ================================================================
# 🔹 LISTAR RASTREOS
# ================================================================
async def listar_rastreos():
    docs = await rastreo_collection.find().sort("fecha_analisis", -1).to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs
