from fastapi import APIRouter, Depends, Request
from typing import List

from app.security import get_current_user
from app.models.usuario import Usuario
from app.utils import get_permission_maps

router = APIRouter(
    prefix="/administracion/modules",
    tags=["modules"],
    # Se quita la dependencia global de check_permissions_auto para manejarla manualmente si es necesario,
    # aunque este endpoint en particular solo requiere autenticación.
)

@router.get("", response_model=List[dict])
async def get_available_modules(request: Request, current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene una lista de todos los módulos y funciones disponibles en la aplicación,
    generada dinámicamente a partir de las rutas de FastAPI para la gestión de perfiles.
    Esta función utiliza la lógica centralizada en `utils.get_permission_maps`.
    """
    # La lógica de inferencia de permisos ahora está centralizada.
    # Simplemente llamamos a la función y devolvemos la lista de módulos para la UI.
    _, modules_list = get_permission_maps(request.app.routes)
    return modules_list