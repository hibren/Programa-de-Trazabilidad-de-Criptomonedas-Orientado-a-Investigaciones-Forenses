from app.database import db, PyObjectId
from app.models.transaccion import TransaccionModel
from app.models.analisis import AnalisisModel
from app.models.alerta import AlertaModel
from app.models.cluster import ClusterModel
from app.models.direccion import DireccionModel
from datetime import datetime

async def detectar_patrones_sospechosos():
    transacciones_cursor = db.transacciones.find({"patrones_sospechosos": {"$in": [[], "", None]}})
    transacciones = await transacciones_cursor.to_list(None)

    resultados = {"analisis": [], "alertas": []}

    for tx_data in transacciones:
        tx = TransaccionModel(**tx_data)
        detected_patterns = []

        if len(tx.inputs) > 5 and tx.monto_total < 1:
            detected_patterns.append("smurfing")
        if tx.monto_total > 10 and len(tx.outputs) > 3:
            detected_patterns.append("layering")
        if len(tx.inputs) > 10 and len(tx.outputs) > 10:
            detected_patterns.append("mixer")

        if detected_patterns:
            # Step 1: Find associated addresses
            direccion_ids = tx.inputs + tx.outputs
            direcciones_cursor = db.direcciones.find({"_id": {"$in": direccion_ids}})
            direcciones = await direcciones_cursor.to_list(None)

            cluster = None
            is_new_cluster = False
            address_strs = []
            if direcciones:
                address_strs = list(set([d['direccion'] for d in direcciones]))
                cluster_doc = await db.clusters.find_one({"direccion": {"$in": address_strs}})

                if cluster_doc:
                    cluster = ClusterModel(**cluster_doc)
                elif address_strs:
                    cluster = ClusterModel(direccion=address_strs)
                    is_new_cluster = True

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
                if is_new_cluster:
                    await db.clusters.insert_one(cluster_data_for_db)
                else:
                    await db.clusters.update_one(
                        {"_id": cluster.id},
                        {"$set": { "tipo_riesgo": cluster.tipo_riesgo, "descripcion": cluster.descripcion }}
                    )

                # Step 4: Create and save analysis, preserving ObjectIds
                analisis = AnalisisModel(cluster=cluster, reportes=[], riesgo="Alto", descripcion=f"...", createdAt=datetime.utcnow())
                analisis_data_for_db = {
                    "_id": analisis.id,
                    "cluster": cluster_data_for_db,
                    "reportes": [],
                    "riesgo": "Alto",
                    "descripcion": f"Patrones detectados: {cluster.tipo_riesgo} en la transacción {tx.hash}",
                    "createdAt": analisis.createdAt
                }
                await db.analisis.insert_one(analisis_data_for_db)
                resultados["analisis"].append(analisis)

                # Step 5: Create and save alert, preserving ObjectIds
                alerta = AlertaModel(tipo_alerta="Patrón Sospechoso", nivel_riesgo="Alto", transacciones=[tx.id], cluster=cluster.id)
                alerta_data_for_db = {
                    "_id": alerta.id,
                    "tipo_alerta": "Patrón Sospechoso",
                    "nivel_riesgo": "Alto",
                    "fecha": alerta.fecha,
                    "transacciones": alerta.transacciones,
                    "cluster": alerta.cluster
                }
                await db.alertas.insert_one(alerta_data_for_db)
                resultados["alertas"].append(alerta)

            # Finally, update the transaction to mark it as analyzed
            await db.transacciones.update_one(
                {"_id": tx.id}, {"$set": {"patrones_sospechosos": detected_patterns}}
            )

    return resultados

async def get_analisis_por_patrones():
    query = { "cluster.tipo_riesgo": { "$regex": "smurfing|layering|mixer", "$options": "i" } }
    analisis_cursor = db.analisis.find(query)
    analisis_list = await analisis_cursor.to_list(None)
    return [AnalisisModel(**analisis) for analisis in analisis_list]
