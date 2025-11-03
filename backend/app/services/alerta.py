from app.database import db
from app.models.alerta import AlertaModel

async def get_all_alertas():
    alertas_cursor = db.alertas.find()
    alertas = await alertas_cursor.to_list(None)
    return [AlertaModel(**alerta) for alerta in alertas]
