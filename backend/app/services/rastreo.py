from datetime import datetime, timedelta, timezone
from app.database import rastreo_collection
from app.services.transaccion import (
    fetch_and_save_transactions_by_address,
    get_all_transacciones,
)
from app.models.transaccion import TransaccionModel


# ================================================================
# 🔹 RASTREO DE ORIGEN — Solo direcciones conectadas al inicial
# ================================================================
async def rastrear_origen(direccion_inicial: str, profundidad: int = 3):
    """
    Rastrear únicamente el origen de fondos que llegan a la dirección_inicial.
    No sigue transacciones aleatorias ni expande fuera de la red que involucra directamente a la dirección analizada.
    """
    print(f"\n🚀 [RASTREO DE ORIGEN] {direccion_inicial} | profundidad={profundidad}")

    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "origen"
    })
    if existente:
        existente["_id"] = str(existente["_id"])
        for r in existente.get("resultado", []):
            if isinstance(r.get("fecha"), datetime):
                r["fecha"] = r["fecha"].isoformat()
        print("📂 Rastreo existente → devolviendo desde Mongo")
        return existente

    await fetch_and_save_transactions_by_address(direccion_inicial)
    txs = await get_all_transacciones()

    resultados = []
    conexiones_validas = set([direccion_inicial])
    nuevas_conexiones = set()

    for nivel in range(profundidad):
        print(f"🔹 Nivel {nivel+1}")

        for tx in txs:
            try:
                if isinstance(tx, dict):
                    tx = TransaccionModel(**tx)

                inputs = tx.inputs or []
                outputs = tx.outputs or []

                # ✅ Solo consideramos transacciones que involucren la dirección inicial o sus fuentes directas
                if any(dest in conexiones_validas for dest in outputs):
                    # Evitar transacciones donde la dirección inicial actúe como emisora
                    if direccion_inicial in inputs:
                        continue

                    destino = [out for out in outputs if out in conexiones_validas][0]
                    for entrada in inputs:
                        if entrada == destino:
                            continue
                        resultados.append({
                            "nivel": nivel + 1,
                            "desde": entrada,
                            "hacia": destino,
                            "monto": tx.monto_total or 0,
                            "hash": tx.hash,
                            "estado": tx.estado or "desconocido",
                            "fecha": (tx.fecha or datetime.now(timezone.utc)).isoformat(),
                        })
                        nuevas_conexiones.add(entrada)

            except Exception as e:
                print(f"⚠️ Error procesando {getattr(tx, 'hash', 'sin-hash')}: {e}")
                continue

        # Solo seguir rastreando si los nuevos “desde” también tienen vínculo con la inicial
        if not nuevas_conexiones:
            break

        conexiones_validas |= nuevas_conexiones
        nuevas_conexiones.clear()

        for nueva_dir in conexiones_validas - {direccion_inicial}:
            await fetch_and_save_transactions_by_address(nueva_dir)

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
        print(f"⚠️ No se encontraron transacciones que lleguen a {direccion_inicial}")
        doc["mensaje"] = f"No se encontraron transacciones entrantes hacia {direccion_inicial}."

    # Convertir fechas a texto
    for r in doc.get("resultado", []):
        if isinstance(r.get("fecha"), datetime):
            r["fecha"] = r["fecha"].isoformat()

    return doc


# ================================================================
# 🔹 RASTREO DE DESTINO — Hacia adelante en la cadena
# ================================================================
async def rastrear_destino(direccion_inicial: str, dias: int = 7):
    """
    Rastrear hacia dónde se dirigen los fondos desde una dirección origen,
    considerando solo las transacciones dentro de los últimos N días.
    """
    print(f"\n🚀 [RASTREO DE DESTINO] {direccion_inicial} | últimos {dias} días")

    # 1️⃣ Revisar si ya existe
    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "destino",
        "dias": dias
    })
    if existente:
        print("📂 Rastreo existente → devolviendo desde Mongo")
        existente["_id"] = str(existente["_id"])
        if "resultado" in existente:
            for r in existente["resultado"]:
                if isinstance(r.get("fecha"), datetime):
                    r["fecha"] = r["fecha"].isoformat()
        return existente

    # 2️⃣ Obtener y filtrar transacciones recientes
    await fetch_and_save_transactions_by_address(direccion_inicial)
    txs = await get_all_transacciones()

    fecha_limite = datetime.now(timezone.utc) - timedelta(days=dias)
    txs_filtradas = []
    for t in txs:
        fecha_tx = getattr(t, "fecha", None)
        if not fecha_tx:
            continue
        if fecha_tx.tzinfo is None:
            fecha_tx = fecha_tx.replace(tzinfo=timezone.utc)
        if fecha_tx >= fecha_limite:
            txs_filtradas.append(t)
    txs = txs_filtradas

    resultados = []

    for tx in txs:
        try:
            if isinstance(tx, dict):
                tx = TransaccionModel(**tx)

            inputs = tx.inputs or []
            outputs = tx.outputs or []

            # ✅ Si la dirección fue EMISORA (input)
            if direccion_inicial in inputs:
                for salida in outputs:
                    resultados.append({
                        "nivel": 1,
                        "desde": direccion_inicial,
                        "hacia": salida,
                        "monto": tx.monto_total or 0,
                        "hash": tx.hash,
                        "estado": tx.estado or "desconocido",
                        "fecha": (tx.fecha or datetime.now(timezone.utc)).isoformat(),
                    })

        except Exception as e:
            print(f"⚠️ Error procesando {getattr(tx, 'hash', 'sin-hash')}: {e}")
            continue

    # 3️⃣ Documento final
    doc = {
        "direccion_inicial": direccion_inicial,
        "tipo": "destino",
        "dias": dias,
        "resultado": resultados,
        "total_conexiones": len(resultados),
        "fecha_analisis": datetime.now(timezone.utc).isoformat(),
    }

    # 4️⃣ Guardar o devolver mensaje
    if resultados:
        await rastreo_collection.insert_one(doc)
        print(f"💾 Rastreo DESTINO guardado ({len(resultados)} conexiones)")
    else:
        print(f"⚠️ No se encontraron transacciones salientes recientes para {direccion_inicial}")
        return {
            "direccion_inicial": direccion_inicial,
            "tipo": "destino",
            "mensaje": f"No se encontraron transacciones salientes (destino) en los últimos {dias} días.",
            "resultado": [],
            "total_conexiones": 0,
            "fecha_analisis": datetime.now(timezone.utc).isoformat(),
        }

    # 🔧 Convertir fechas
    for r in doc.get("resultado", []):
        if isinstance(r.get("fecha"), datetime):
            r["fecha"] = r["fecha"].isoformat()

    return doc


# ================================================================
# 🔹 LISTAR RASTREOS
# ================================================================
async def listar_rastreos():
    docs = await rastreo_collection.find().sort("fecha_analisis", -1).to_list(100)

    for d in docs:
        d["_id"] = str(d["_id"])
        if "resultado" in d:
            for r in d["resultado"]:
                if isinstance(r.get("fecha"), datetime):
                    r["fecha"] = r["fecha"].isoformat()
        if isinstance(d.get("fecha_analisis"), datetime):
            d["fecha_analisis"] = d["fecha_analisis"].isoformat()

    return docs
