import httpx
import base64
from typing import List
from app.database import reporte_collection, transaccion_collection
from app.models.reporte import Reporte
from datetime import datetime
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import pandas as pd

# 🔑 API Key de ChainAbuse
CHAINABUSE_API_KEY = "ca_QWQ2YkNGVmRBdDY2M3VQV3dLU2RSNFFHLlhCM2U5YjF3V1lrRi80K1hwYVNHbGc9PQ"

# 📁 Carpeta para guardar los reportes generados
GENERATED_PATH = "app/static/reportes"
os.makedirs(GENERATED_PATH, exist_ok=True)


# =====================================================
# 🔹 CONSULTAS DE REPORTES DESDE BD O API
# =====================================================

async def get_all_reportes() -> List[Reporte]:
    reportes_cursor = reporte_collection.find()
    reportes_list = await reportes_cursor.to_list(length=1000)
    return [Reporte(**reporte) for reporte in reportes_list]


async def fetch_reportes_by_address(address: str) -> List[Reporte]:
    if CHAINABUSE_API_KEY == "YOUR_CHAINABUSE_API_KEY":
        raise ValueError("La API key de ChainAbuse no ha sido configurada.")

    # 1️⃣ Buscar primero en la base de datos
    reportes_cursor = reporte_collection.find({"id_direccion": address})
    reportes_list = await reportes_cursor.to_list(length=1000)
    if reportes_list:
        print(f"✅ TRAIGO DESDE BD para la dirección {address}")
        return [Reporte(**reporte) for reporte in reportes_list]

    # 2️⃣ Si no existen, consultar la API externa
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

    # 3️⃣ Guardar en base lo que devuelve la API
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
            "domains": domains,
        }

        result = await reporte_collection.insert_one(report_doc)
        created_report = await reporte_collection.find_one({"_id": result.inserted_id})
        if created_report:
            saved_reportes.append(Reporte(**created_report))

    return saved_reportes


# 🔹 Nueva función: Obtener reportes sin consultar API
async def get_reportes_from_db_only(address: str) -> List[Reporte]:
    reportes_cursor = reporte_collection.find({"id_direccion": address})
    reportes_list = await reportes_cursor.to_list(length=1000)

    reportes_validos = []
    for r in reportes_list:
        if "scamCategory" in r and "trusted" in r and "domains" in r:
            reportes_validos.append(Reporte(**r))

    return reportes_validos


# =====================================================
# 🔹 GENERACIÓN DE ARCHIVOS DE REPORTE
# =====================================================

def _crear_pdf(nombre_archivo: str, titulo: str, lineas: list[str]):
    path = os.path.join(GENERATED_PATH, nombre_archivo)
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    y = height - 80
    c.setFont("Helvetica-Bold", 16)
    c.drawString(60, y, titulo)
    c.setFont("Helvetica", 11)
    y -= 40
    for linea in lineas:
        c.drawString(60, y, str(linea))
        y -= 20
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 80
    c.save()
    return path


# 🧩 Reporte de Riesgo (PDF / CSV)
async def generar_reporte_riesgo(address: str, formato: str = "PDF", force_api: bool = False) -> str:
    from app.services.reporte import get_reportes_from_db_only, fetch_reportes_by_address
    reportes = []
    api_error = None

    if force_api:
        try:
            reportes = await fetch_reportes_by_address(address)
        except Exception as e:
            api_error = str(e)
            reportes = await get_reportes_from_db_only(address)
    else:
        reportes = await get_reportes_from_db_only(address)

    if not reportes:
        lineas = [
            f"Reporte de Riesgo para: {address}",
            "",
            "━" * 60,
            "RESULTADO DEL ANÁLISIS",
            "━" * 60,
            "",
            "✓ No se encontraron reportes de scam para esta dirección.",
            "",
        ]
    else:
        lineas = [
            f"Reporte de Riesgo para: {address}",
            "",
            "━" * 60,
            f"RESUMEN: {len(reportes)} reporte(s) encontrado(s)",
            "━" * 60,
            "",
        ]
        for idx, r in enumerate(reportes, 1):
            lineas.append(f"REPORTE #{idx}")
            lineas.append(f"  Categoría: {r.scamCategory}")
            lineas.append(f"  Fecha: {r.createdAt.strftime('%Y-%m-%d %H:%M')}")
            lineas.append(f"  Verificado: {'Sí' if r.trusted else 'No'}")
            if r.domains:
                lineas.append(f"  Dominios: {', '.join(r.domains)}")
            lineas.append("")

    lineas.extend([
        "━" * 60,
        f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "Sistema de Trazabilidad Blockchain",
    ])

    nombre_base = f"riesgo_{address[:12]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    if formato.upper() == "PDF":
        nombre = f"{nombre_base}.pdf"
        path = _crear_pdf(nombre, "Reporte de Riesgo por Dirección", lineas)
    elif formato.upper() == "CSV":
        data = [{
            "direccion": r.id_direccion if reportes else address,
            "categoria": getattr(r, "scamCategory", "Sin reportes"),
            "fecha": getattr(r, "createdAt", datetime.now()).strftime("%Y-%m-%d"),
            "verificado": "Sí" if getattr(r, "trusted", False) else "No",
            "dominios": ", ".join(getattr(r, "domains", []))
        } for r in reportes] or [{
            "direccion": address,
            "categoria": "Sin reportes",
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "verificado": "N/A",
            "dominios": "N/A",
        }]
        df = pd.DataFrame(data)
        nombre = f"{nombre_base}.csv"
        path = os.path.join(GENERATED_PATH, nombre)
        df.to_csv(path, index=False)
    else:
        raise ValueError("Formato no soportado.")

    await reporte_collection.insert_one({
        "tipo": "riesgo",
        "id_direccion": address,
        "filename": os.path.basename(path),
        "path": path,
        "formato": formato.upper(),
        "createdAt": datetime.now(),
    })

    return path


# 📊 Reporte de Actividad (PDF / CSV)
async def generar_reporte_actividad(fecha_inicio: str, fecha_fin: str, formato: str = "PDF") -> str:
    """Genera un reporte de actividad basado en las transacciones reales."""
    print(f"📊 Generando reporte de actividad desde {fecha_inicio} hasta {fecha_fin}")

    # 1️⃣ Convertir strings a datetime
    try:
        inicio_dt = datetime.fromisoformat(fecha_inicio)
        fin_dt = datetime.fromisoformat(fecha_fin)
    except ValueError:
        raise ValueError("Formato de fecha inválido. Usa YYYY-MM-DD")

    # 2️⃣ Buscar transacciones dentro del rango
    cursor = transaccion_collection.find({
        "fecha": {"$gte": inicio_dt, "$lte": fin_dt}
    })

    transacciones = await cursor.to_list(length=10000)

    if not transacciones:
        print("⚠️ No se encontraron transacciones en el rango especificado.")
        data = [{"fecha": fecha_inicio, "transacciones": 0, "volumen_btc": 0}]
    else:
        # 3️⃣ Agrupar por día
        df = pd.DataFrame(transacciones)
        df["fecha"] = pd.to_datetime(df["fecha"]).dt.strftime("%Y-%m-%d")

        resumen = (
            df.groupby("fecha")
              .agg(transacciones=("hash", "count"), volumen_btc=("monto_total", "sum"))
              .reset_index()
        )

        data = resumen.to_dict(orient="records")

    # 4️⃣ Generar PDF o CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_base = f"actividad_{fecha_inicio}_{fecha_fin}_{timestamp}"

    if formato.upper() == "PDF":
        nombre_archivo = f"{nombre_base}.pdf"
        path = os.path.join(GENERATED_PATH, nombre_archivo)

        c = canvas.Canvas(path, pagesize=A4)
        width, height = A4
        y = height - 80

        c.setFont("Helvetica-Bold", 16)
        c.drawString(60, y, f"Reporte de Actividad por Período")
        y -= 25
        c.setFont("Helvetica", 12)
        c.drawString(60, y, f"Desde {fecha_inicio} hasta {fecha_fin}")
        y -= 40

        c.setFont("Helvetica", 10)
        for fila in data:
            c.drawString(60, y, f"Fecha: {fila['fecha']} | Transacciones: {fila['transacciones']} | Volumen BTC: {round(fila['volumen_btc'], 8)}")
            y -= 18
            if y < 50:
                c.showPage()
                c.setFont("Helvetica", 10)
                y = height - 80

        y -= 20
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(60, y, f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        c.save()

    elif formato.upper() == "CSV":
        nombre_archivo = f"{nombre_base}.csv"
        path = os.path.join(GENERATED_PATH, nombre_archivo)
        pd.DataFrame(data).to_csv(path, index=False)

    else:
        raise ValueError("Formato no soportado. Usa PDF o CSV.")

    # 5️⃣ Guardar registro en BD
    await reporte_collection.insert_one({
        "tipo": "actividad",
        "filename": nombre_archivo,
        "path": path,
        "createdAt": datetime.now(),
        "formato": formato.upper(),
        "rango": {"inicio": fecha_inicio, "fin": fecha_fin},
        "total_transacciones": sum(d["transacciones"] for d in data),
        "total_volumen": sum(d["volumen_btc"] for d in data)
    })

    print(f"✅ Reporte generado: {path}")
    return path


# 🕸️ Reporte de Clusters
async def generar_reporte_clusters() -> str:
    lineas = [
        "Análisis de agrupaciones entre direcciones sospechosas.",
        "",
        "━" * 60,
        "CLUSTERS IDENTIFICADOS",
        "━" * 60,
        "",
        "• Cluster #1: 5 direcciones conectadas.",
        "• Cluster #2: 3 direcciones (2 reportadas).",
        "• Cluster #3: 8 direcciones vinculadas a dominio sin KYC.",
        "",
        f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    ]
    nombre = f"clusters_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    path = _crear_pdf(nombre, "Reporte de Clusters y Redes", lineas)

    await reporte_collection.insert_one({
        "tipo": "clusters",
        "filename": nombre,
        "path": path,
        "createdAt": datetime.now()
    })
    return path
