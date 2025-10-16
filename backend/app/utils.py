# app/utils.py
#from app.database import PyObjectId
#from app.ain import PyObjectId

def direccion_helper(direccion) -> dict:
    return {
        "id": str(direccion["_id"]),  # mapear ObjectId a str
        "direccion": direccion["direccion"],
        "balance": direccion["balance"],
        "total_recibido": direccion["total_recibido"],
        "total_enviado": direccion["total_enviado"],
        "perfil_riesgo": direccion["perfil_riesgo"]
    }

def bloque_helper(bloque) -> dict:
    return {
        "id": str(bloque["_id"]),  # mapear ObjectId a str
        "numero_bloque": bloque["numero_bloque"],
        "hash": bloque["hash"],
        "fecha": str(bloque["fecha"]),  # convertir fecha a string si es necesario
        "recompensa_total": bloque["recompensa_total"],
        "volumen_total": bloque["volumen_total"]
    }

def transaccion_helper(transaccion) -> dict:
    return {
        "id": str(transaccion["_id"]),
        "hash": transaccion["hash"],
        "fecha": transaccion["fecha"].isoformat() if hasattr(transaccion["fecha"], "isoformat") else str(transaccion["fecha"]),
        "inputs": [str(d) for d in transaccion["inputs"]],   # Ajusta según cómo almacenes DireccionModel
        "outputs": [str(d) for d in transaccion["outputs"]], # Ajusta según cómo almacenes DireccionModel
        "monto_total": transaccion["monto_total"],
        "estado": transaccion["estado"],
        "patrones_sospechosos": transaccion.get("patrones_sospechosos", []),
        "bloque": str(transaccion["bloque"]) if transaccion.get("bloque") else None
    }


from typing import List, Dict, Any, Tuple

def get_permission_maps(routes: List[Any]) -> Tuple[Dict[Tuple[str, str], Tuple[str, str]], List[Dict[str, Any]]]:
    """
    Inspecciona las rutas de la aplicación y genera dos estructuras de datos:
    1. Un mapa de permisos para la validación de seguridad en tiempo de ejecución.
    2. Una lista de módulos y funciones para ser consumida por la UI.

    Esta función es la única fuente de verdad para la lógica de permisos dinámicos,
    garantizando consistencia en toda la aplicación.

    Args:
        routes: La lista de rutas de la aplicación FastAPI (request.app.routes).

    Returns:
        Un tuple conteniendo:
        - permission_map: Un diccionario que mapea (METODO, /ruta/template) a (/ruta_modulo, funcion_requerida).
        - modules_list: Una lista de diccionarios representando los módulos y sus funciones.
    """
    permission_map: Dict[Tuple[str, str], Tuple[str, str]] = {}
    modules_for_ui: Dict[str, Dict[str, Any]] = {}

    method_to_function = {
        "GET": "listar",
        "POST": "crear",
        "PUT": "actualizar",
        "DELETE": "eliminar",
    }

    for route in routes:
        if not hasattr(route, "path_format") or not hasattr(route, "methods"):
            continue

        path_template = route.path_format

        # Ignorar rutas públicas o de sistema que no requieren permisos de perfil.
        if path_template.startswith(('/docs', '/openapi.json', '/health', '/redoc')) or path_template in ["/", "/administracion/usuarios/login", "/administracion/usuarios/me/perfil", "/administracion/modules"]:
            continue

        path_parts = [part for part in path_template.strip('/').split('/') if part]
        if not path_parts:
            continue

        # 1. Determinar el módulo (required_ruta) y su nombre para la UI.
        if path_parts[0] == 'administracion' and len(path_parts) > 1:
            required_ruta = f"/{path_parts[0]}/{path_parts[1]}"
            module_name = f"Administracion {path_parts[1].capitalize()}"
        else:
            required_ruta = f"/{path_parts[0]}"
            module_name = path_parts[0].capitalize()

        if required_ruta not in modules_for_ui:
            modules_for_ui[required_ruta] = {
                "nombre": module_name,
                "ruta": required_ruta,
                "funciones": set()
            }

        # 2. Determinar la función (required_funcion) para cada método HTTP.
        for method in route.methods:
            required_funcion = None

            # Lógica de inferencia de la función requerida (Refactorizada).
            is_admin_module = path_parts[0] == 'administracion'
            base_module_len = 2 if is_admin_module else 1

            # Caso especial para acciones que no siguen el patrón REST estándar.
            if required_ruta == "/analisis" and method == "POST" and path_template.endswith(("/riesgo", "/generar")):
                required_funcion = "ejecutar"
            # Prioridad 1: Acción custom (ej: /recursos/accion_custom)
            elif len(path_parts) > base_module_len and '{' not in path_parts[-1]:
                required_funcion = path_parts[-1].replace("-", "_")
            # Prioridad 2: Ruta con ID (ej: /recursos/{id})
            elif len(path_parts) > base_module_len and '{' in path_parts[-1]:
                if method == "GET":
                    required_funcion = "obtener"
                else:
                    # PUT, DELETE para un recurso específico
                    required_funcion = method_to_function.get(method)
            # Prioridad 3: Ruta base (ej: /recursos/)
            elif len(path_parts) == base_module_len:
                # GET para listar, POST para crear
                required_funcion = method_to_function.get(method)

            if required_funcion:
                # Poblar el mapa de permisos para la validación de seguridad.
                permission_map[(method, path_template)] = (required_ruta, required_funcion)
                
                # Poblar la estructura para la UI.
                desc = f"Permiso para {required_funcion} en {required_ruta}"
                modules_for_ui[required_ruta]["funciones"].add((required_funcion, desc))

    # Convertir el set de funciones a una lista ordenada de diccionarios para la respuesta JSON.
    final_modules_list = []
    for module_data in sorted(modules_for_ui.values(), key=lambda m: m['nombre']):
        module_data["funciones"] = [{"nombre": name, "descripcion": desc} for name, desc in sorted(list(module_data["funciones"]))]
        final_modules_list.append(module_data)

    return permission_map, final_modules_list