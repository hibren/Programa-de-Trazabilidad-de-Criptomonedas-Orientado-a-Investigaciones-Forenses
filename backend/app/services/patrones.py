from app.database import db, PyObjectId
from app.models.transaccion import TransaccionModel
from pydantic import ValidationError
from app.models.analisis import AnalisisModel
from app.models.alerta import AlertaModel
from app.models.cluster import ClusterModel
from app.models.direccion import DireccionModel
from datetime import datetime

async def detectar_patrones_sospechosos():
    # Se revierte a la consulta original que busca transacciones no analizadas (campo vacío o nulo).
    transacciones_cursor = db.transacciones.find({"patrones_sospechosos": {"$in": [[], "", None]}})
    transacciones = await transacciones_cursor.to_list(None)

    resultados = {"analisis": [], "alertas": []}

    for tx_data in transacciones:
        try:
            tx = TransaccionModel(**tx_data)
            detected_patterns = []

            if len(tx.inputs) > 5 and tx.monto_total < 1:
                detected_patterns.append("smurfing")
            if tx.monto_total > 10 and len(tx.outputs) > 3:
                detected_patterns.append("layering")
            if len(tx.inputs) > 10 and len(tx.outputs) > 10:
                detected_patterns.append("mixer")

            if detected_patterns:
                # Determinar el nivel de riesgo más alto basado en los patrones detectados
                riesgo_nivel = "Bajo"  # Por defecto, aunque será sobrescrito
                if "mixer" in detected_patterns:
                    riesgo_nivel = "Crítico"
                elif "layering" in detected_patterns:
                    riesgo_nivel = "Muy Alto"
                elif "smurfing" in detected_patterns:
                    riesgo_nivel = "Alto"

                # CORRECCIÓN CLAVE: Actualizar la transacción INMEDIATAMENTE después de detectar un patrón.
                # Esto rompe el bucle de re-procesamiento, incluso si los pasos siguientes (cluster, análisis) fallan.
                await db.transacciones.update_one(
                    {"_id": tx.id}, {"$set": {"patrones_sospechosos": detected_patterns}})

                # Step 1: Find associated addresses
                direccion_ids = tx.inputs + tx.outputs
                direcciones_cursor = db.direcciones.find({"_id": {"$in": direccion_ids}})
                direcciones = await direcciones_cursor.to_list(None)

                cluster = None
                address_strs = []
                if direcciones:
                    address_strs = list(set([d['direccion'] for d in direcciones]))
                    # Se crea un nuevo clúster para cada detección de patrón,
                    # en lugar de buscar y reutilizar uno existente.
                    # Esto aísla cada caso.
                    cluster = ClusterModel(direccion=address_strs)

                if cluster:
                    # Step 2: Modify the cluster object in memory
                    cluster.tipo_riesgo = ", ".join(detected_patterns)
                    cluster.descripcion = f"Patrones detectados: {cluster.tipo_riesgo}"
                    # Prepare cluster data for DB, preserving ObjectId
                    cluster_data_for_db = {
                        "_id": cluster.id,
                        "direccion": cluster.direccion,
                        "tipo_riesgo": cluster.tipo_riesgo,
                        "descripcion": cluster.descripcion,
                        "wallet_id": cluster.wallet_id,
                        "label": cluster.label,
                        "updated_to_block": cluster.updated_to_block
                    }

                    # Step 3: Write the cluster to the database
                    await db.clusters.insert_one(cluster_data_for_db)

                    # Step 4: Create and save analysis, preserving ObjectIds
                    analisis = AnalisisModel(cluster=cluster, reportes=[], riesgo=riesgo_nivel, descripcion=f"...", createdAt=datetime.utcnow())
                    analisis_data_for_db = {
                        "_id": analisis.id,
                        "cluster": cluster_data_for_db,
                        "reportes": [],
                        "riesgo": riesgo_nivel,
                        "descripcion": f"Patrones detectados: {cluster.tipo_riesgo} en la transacción {tx.hash}",
                        "createdAt": analisis.createdAt
                    }
                    await db.analisis.insert_one(analisis_data_for_db)
                    resultados["analisis"].append(analisis)

                    # Step 5: Create and save alert, preserving ObjectIds
                    alerta = AlertaModel(tipo_alerta="Patrón Sospechoso", nivel_riesgo=riesgo_nivel, transacciones=[tx.id], cluster=cluster.id)
                    alerta_data_for_db = {
                        "_id": alerta.id,
                        "tipo_alerta": "Patrón Sospechoso",
                        "nivel_riesgo": riesgo_nivel,
                        "fecha": alerta.fecha,
                        "transacciones": alerta.transacciones,
                        "cluster": alerta.cluster
                    }
                    await db.alertas.insert_one(alerta_data_for_db)
                    resultados["alertas"].append(alerta)
        except ValidationError as e:
            print(f"⚠️  Error de validación al procesar la transacción {tx_data.get('_id')}: {e}")
            continue

    return resultados

async def get_analisis_por_patrones():
    query = { "cluster.tipo_riesgo": { "$regex": "smurfing|layering|mixer", "$options": "i" } }
    analisis_cursor = db.analisis.find(query)
    analisis_list = await analisis_cursor.to_list(None)
    return [AnalisisModel(**analisis) for analisis in analisis_list]
