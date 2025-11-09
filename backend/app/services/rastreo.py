from datetime import datetime, timedelta, timezone
from app.database import rastreo_collection, transaccion_collection, direccion_collection
from app.services.transaccion import (
    _fetch_raw_transactions_by_address,
    fetch_and_save_transactions_by_address,
    get_all_transacciones,
)
from app.models.transaccion import TransaccionModel
from app.models.rastreo import RastreoModel, Conexion
from app.database import PyObjectId
import asyncio
from app.services.direccion import fetch_and_save_direccion

# ================================================================
# 🔹 HELPER: Convertir ObjectId a dirección Bitcoin
# ================================================================
async def _resolve_direccion(obj_id) -> str:
    """Convierte un ObjectId de dirección a su address Bitcoin"""
    if isinstance(obj_id, str):
        if len(obj_id) > 26:  # Ya es una dirección Bitcoin
            return obj_id
        obj_id = PyObjectId(obj_id)
    
    doc = await direccion_collection.find_one({"_id": obj_id})
    return doc["direccion"] if doc else str(obj_id)


# ================================================================
# 🔹 RASTREO DE ORIGEN — Hacia atrás en la cadena (CORREGIDO)
# ================================================================
async def rastrear_origen(direccion_inicial: str, profundidad: int = 3):
    """
    Rastrear únicamente el origen de fondos que llegan a la dirección_inicial.
    Solo sigue transacciones donde la dirección aparece en OUTPUTS (recibiendo fondos).
    """
    print(f"\n🚀 [RASTREO DE ORIGEN] {direccion_inicial} | profundidad={profundidad}")

    # Verificar si ya existe el rastreo guardado
    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "origen"
    })
    if existente:
        existente["id"] = str(existente.get("_id", ""))
        existente.pop("_id", None)
        for r in existente.get("resultado", []):
            if isinstance(r.get("fecha"), datetime):
                r["fecha"] = r["fecha"].isoformat()
        if isinstance(existente.get("fecha_analisis"), datetime):
            existente["fecha_analisis"] = existente["fecha_analisis"].isoformat()
        print("📂 Rastreo existente → devolviendo desde Mongo")
        return existente

    # 🔹 PASO 0: Asegurarse de que la dirección inicial exista en la BD
    print(f"🌐 [Paso 0] Asegurando que la dirección {direccion_inicial[:8]}... exista en la BD.")
    try:
        await fetch_and_save_direccion(direccion_inicial)
        print(f"   ✅ Dirección {direccion_inicial[:8]}... guardada/actualizada.")
    except Exception as e:
        print(f"   ⚠️ Error al guardar la dirección inicial {direccion_inicial[:8]}...: {e}")
        # No detenemos el proceso, intentamos continuar con lo que haya en la BD.
    
    # 🔹 PASO 1: Obtener las transacciones de la dirección inicial desde BlockCypher
    print(f"🌐 [Paso 1] Consultando transacciones para {direccion_inicial[:8]}...")
    try:
        await fetch_and_save_transactions_by_address(direccion_inicial)
    except Exception as e:
        print(f"⚠️ Error al consultar BlockCypher: {e}")
        # Si falla BlockCypher, intentamos con datos locales
        pass

    resultados = []
    direcciones_procesadas = set()
    direcciones_a_procesar = {direccion_inicial}

    for nivel in range(profundidad):
        print(f"🔹 Nivel {nivel + 1} - Procesando {len(direcciones_a_procesar)} direcciones")
        nuevas_direcciones = set()

        for direccion_actual in direcciones_a_procesar:
            if direccion_actual in direcciones_procesadas:
                continue

            # 🔹 PASO 2: Obtener el ObjectId de la dirección actual
            direccion_doc = await direccion_collection.find_one({"direccion": direccion_actual})
            if not direccion_doc:
                print(f"⚠️ Dirección {direccion_actual[:8]}... no encontrada en DB local")
                direcciones_procesadas.add(direccion_actual)
                continue
            
            direccion_obj_id = direccion_doc["_id"]
            print(f"   🔍 Buscando transacciones donde {direccion_actual[:8]}... esté en OUTPUTS")

            # 🔹 PASO 3: Buscar transacciones donde esta dirección RECIBIÓ fondos
            cursor = transaccion_collection.find(
                # Para rastrear el origen, buscamos transacciones donde la dirección es un output (recibió fondos)
                {"outputs": direccion_obj_id}
            ).limit(10)
            
            txs_recibidas = await cursor.to_list(length=None)
            print(f"   📥 {direccion_actual[:8]}... recibió {len(txs_recibidas)} transacciones")

            for tx_doc in txs_recibidas:
                try:
                    tx = TransaccionModel(**tx_doc)

                    # 🔹 PASO 4: Resolver ObjectIds a direcciones Bitcoin reales
                    input_addresses = []
                    for input_id in (tx.inputs or [])[:5]:  # Limitar a 5
                        addr = await _resolve_direccion(input_id)
                        if addr:
                            input_addresses.append(addr)
                    
                    output_addresses = []
                    for output_id in (tx.outputs or [])[:5]:
                        addr = await _resolve_direccion(output_id)
                        if addr:
                            output_addresses.append(addr)

                    # Verificar que la dirección actual está en outputs
                    if direccion_actual not in output_addresses:
                        print(f"   ⚠️ TX {tx.hash[:8]}... no tiene a {direccion_actual[:8]} en outputs")
                        continue
                    
                    # No rastrear si es una autotransferencia
                    if direccion_inicial in input_addresses:
                        print(f"   ⏭️ TX {tx.hash[:8]}... es autotransferencia, ignorando")
                        continue

                    # Evitar duplicados
                    existe = any(
                        r["hacia"] == direccion_actual and r["hash"] == tx.hash
                        for r in resultados
                    )
                    if existe:
                        continue

                    # 🔹 PASO 5: Guardar resultado con información clara
                    resultados.append({
                        "nivel": nivel + 1,
                        "desde": input_addresses[0] if len(input_addresses) == 1 
                                else f"{len(input_addresses)} direcciones",
                        "hacia": direccion_actual,
                        "monto": tx.monto_total or 0,
                        "hash": tx.hash,
                        "estado": tx.estado or "desconocido",
                        "fecha": (tx.fecha or datetime.now(timezone.utc)).isoformat(),
                    })

                    print(
                        f"   ✅ {direccion_actual[:8]}... recibió {tx.monto_total:.8f} BTC "
                        f"de {len(input_addresses)} dirección(es)"
                    )

                    # 🔹 PASO 6: Agregar direcciones de origen para siguiente nivel
                    for input_addr in input_addresses:
                        if (input_addr not in direcciones_procesadas 
                            and input_addr != direccion_inicial
                            and input_addr != direccion_actual):
                            nuevas_direcciones.add(input_addr)

                except Exception as e:
                    print(f"⚠️ Error procesando {tx_doc.get('hash', 'sin-hash')}: {e}")
                    import traceback
                    traceback.print_exc()
                    continue

            direcciones_procesadas.add(direccion_actual)

        if not nuevas_direcciones:
            print(f"✅ Nivel {nivel + 1}: No hay más orígenes por rastrear")
            break

        print(f"🔄 Nivel {nivel + 1}: Encontradas {len(nuevas_direcciones)} nuevas direcciones")

        # 🔹 PASO 7: Consultar nuevas direcciones en BlockCypher (con límite)
        MAX_DIRECCIONES_POR_NIVEL = 3  # Reducido para evitar rate limits
        for i, nueva_dir in enumerate(list(nuevas_direcciones)[:MAX_DIRECCIONES_POR_NIVEL]):
            print(f"   🌐 [{i+1}/{MAX_DIRECCIONES_POR_NIVEL}] consultando {nueva_dir[:8]}...")
            try:
                await fetch_and_save_transactions_by_address(nueva_dir)
                await asyncio.sleep(2)  # Delay para evitar rate limits
            except Exception as e:
                print(f"⚠️ Error al consultar {nueva_dir[:8]}...: {e}")
                # No fallar todo el proceso por un error
                continue

        direcciones_a_procesar = nuevas_direcciones

    # ===============================================================
    # 📦 Construcción y guardado del modelo Rastreo
    # ===============================================================
    if resultados:
        conexiones = [Conexion(**r) for r in resultados]
        rastreo = RastreoModel(
            direccion_inicial=direccion_inicial,
            tipo="origen",
            resultado=conexiones,
            total_conexiones=len(conexiones),
            fecha_analisis=datetime.now(timezone.utc),
        )

        try:
            insert_result = await rastreo_collection.insert_one(
                rastreo.model_dump(by_alias=True, exclude={'id'})
            )
            rastreo.id = str(insert_result.inserted_id)
        except Exception as e:
            import traceback
            print("⚠️ Error al guardar rastreo en Mongo:", e)
            traceback.print_exc()
            raise

        print(f"💾 Rastreo ORIGEN guardado ({len(conexiones)} conexiones)")
        return rastreo.model_dump(mode="json", by_alias=True)

    # 🔸 Si no hay resultados, devolver modelo vacío válido
    rastreo_vacio = RastreoModel(
        id=None,
        direccion_inicial=direccion_inicial,
        tipo="origen",
        resultado=[],
        total_conexiones=0,
        fecha_analisis=datetime.now(timezone.utc)
    )

    print(f"⚠️ No se encontraron transacciones que lleguen a {direccion_inicial}")
    return rastreo_vacio.model_dump(mode="json", by_alias=True)


# ================================================================
# 🔹 RASTREO DE DESTINO — Hacia adelante en la cadena (CORREGIDO)
# ================================================================
async def rastrear_destino(direccion_inicial: str, dias: str = "7"): # Acepta str para "historico"
    """
    Rastrear hacia dónde se dirigen los fondos desde una dirección origen.
    """
    periodo_str = f"últimos {dias} días" if dias != "historico" else "histórico"
    print(f"\n🚀 [RASTREO DE DESTINO] {direccion_inicial} | período={periodo_str}")

    existente = await rastreo_collection.find_one({
        "direccion_inicial": direccion_inicial,
        "tipo": "destino",
    })
    if existente:
        existente["id"] = str(existente.get("_id", ""))
        existente.pop("_id", None)
        for r in existente.get("resultado", []):
            if isinstance(r.get("fecha"), datetime):
                r["fecha"] = r["fecha"].isoformat()
        if isinstance(existente.get("fecha_analisis"), datetime):
            existente["fecha_analisis"] = existente["fecha_analisis"].isoformat()
        print("📂 Rastreo DESTINO existente → devolviendo desde Mongo")
        return existente

    # 🔹 PASO 0: Asegurarse de que la dirección inicial exista en la BD
    print(f"🌐 [Paso 0] Asegurando que la dirección {direccion_inicial[:8]}... exista en la BD.")
    try:
        await fetch_and_save_direccion(direccion_inicial)
        print(f"   ✅ Dirección {direccion_inicial[:8]}... guardada/actualizada.")
    except Exception as e:
        print(f"   ⚠️ Error al guardar la dirección inicial {direccion_inicial[:8]}...: {e}")

    # Obtener transacciones de BlockCypher
    try:
        await fetch_and_save_transactions_by_address(direccion_inicial)
    except Exception as e:
        print(f"⚠️ Error al consultar BlockCypher: {e}")

    # Obtener el ObjectId de la dirección inicial
    direccion_doc = await direccion_collection.find_one({"direccion": direccion_inicial})
    if not direccion_doc:
        print(f"⚠️ Dirección no encontrada: {direccion_inicial}")
        return {
            "direccion_inicial": direccion_inicial,
            "tipo": "destino",
            "mensaje": "Dirección no encontrada en la base de datos",
            "resultado": [],
            "total_conexiones": 0,
            "fecha_analisis": datetime.now(timezone.utc).isoformat(),
        }
    
    direccion_obj_id = direccion_doc["_id"]

    # Construir el filtro de consulta
    query_filter = {"inputs": direccion_obj_id}
    if dias != "historico": # Si no es histórico, aplicar filtro de fecha
        try:
            dias_int = int(dias)
            fecha_limite = datetime.now(timezone.utc) - timedelta(days=dias_int)
            query_filter["fecha"] = {"$gte": fecha_limite}
        except ValueError:
            print(f"⚠️ Valor de 'dias' no válido: {dias}. Se procederá sin filtro de fecha.")
    else:
        print("ℹ️ Realizando búsqueda histórica sin límite de fecha.")

    # Buscar transacciones donde la dirección es un input (envió fondos)
    cursor = transaccion_collection.find(query_filter).limit(50)
    
    txs_enviadas = await cursor.to_list(length=None)
    print(f"📤 {direccion_inicial[:8]}... envió {len(txs_enviadas)} transacciones")

    resultados = []

    for tx_doc in txs_enviadas:
        try:
            tx = TransaccionModel(**tx_doc)
            
            # Resolver direcciones de salida (outputs)
            for output_id in (tx.outputs or []):
                output_addr = await _resolve_direccion(output_id)
                
                # El destino no puede ser la misma dirección de origen
                if output_addr and output_addr != direccion_inicial:
                    # Evitar duplicados en los resultados
                    if not any(r["hash"] == tx.hash and r["hacia"] == output_addr for r in resultados):
                        resultados.append({
                            "nivel": 1,
                            "desde": direccion_inicial,
                            "hacia": output_addr,
                            "monto": tx.monto_total or 0, # Idealmente, aquí iría el monto específico del output
                            "hash": tx.hash,
                            "estado": tx.estado or "desconocido",
                            "fecha": (tx.fecha or datetime.now(timezone.utc)).isoformat(),
                        })
                        print(f"   ✅ {direccion_inicial[:8]}... envió fondos a {output_addr[:8]}... (TX: {tx.hash[:8]})")


        except Exception as e:
            print(f"⚠️ Error procesando {tx_doc.get('hash', 'sin-hash')}: {e}")
            continue

    if resultados:
        conexiones = [Conexion(**r) for r in resultados]
        rastreo = RastreoModel(
            direccion_inicial=direccion_inicial,
            tipo="destino",
            resultado=conexiones,
            total_conexiones=len(conexiones),
            fecha_analisis=datetime.now(timezone.utc),
        )
        # Guardar el rastreo en la base de datos
        insert_result = await rastreo_collection.insert_one(
            rastreo.model_dump(by_alias=True, exclude={'id'})
        )
        rastreo.id = str(insert_result.inserted_id)

        print(f"💾 Rastreo DESTINO guardado ({len(conexiones)} conexiones)")
        return rastreo.model_dump(mode="json", by_alias=True)
    else:
        print(f"⚠️ No se encontraron transacciones salientes")
        rastreo_vacio = RastreoModel(
            id=None,
            direccion_inicial=direccion_inicial,
            tipo="destino",
            mensaje=f"No se encontraron transacciones salientes para el período seleccionado.",
            resultado=[],
            total_conexiones=0,
            fecha_analisis=datetime.now(timezone.utc),
        )
        return rastreo_vacio.model_dump(mode="json", by_alias=True, exclude_none=True)


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