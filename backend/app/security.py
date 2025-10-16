from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.database import db
from app.models.usuario import Usuario
from app.utils import get_permission_maps

# --- Configuración de Autenticación ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "la$clave$secret$awowowowowowowowowowow$"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/administracion/usuarios/login")

# --- Cache para el mapa de permisos ---
# Esto se llenará en la primera llamada a check_permissions_auto
permission_map_cache: Dict[Tuple[str, str], Tuple[str, str]] = {}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_user(username: str) -> Optional[Usuario]:
    user_data = await db.usuarios.find_one({"username": username})
    return Usuario.model_validate(user_data) if user_data else None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user(username=username)
    if user is None:
        raise credentials_exception
    return user

# --- Lógica de Permisos Refactorizada ---

async def check_permissions_auto(request: Request, current_user: Usuario = Depends(get_current_user)):
    """
    Valida si el usuario actual tiene permiso para acceder a la ruta solicitada.
    Utiliza un mapa de permisos cacheado generado a partir de la lógica centralizada
    en `utils.get_permission_maps`.
    """
    global permission_map_cache
    # Genera el mapa de permisos en la primera ejecución y lo cachea.
    if not permission_map_cache:
        permission_map_cache, _ = get_permission_maps(request.app.routes)

    route = request.scope.get("route")
    if not route or not hasattr(route, 'path_format'):
        # No se puede determinar la ruta, denegar por seguridad.
        raise HTTPException(status_code=403, detail="Could not determine route for permission check")

    path_template = route.path_format
    method = request.method

    # La lógica para ignorar rutas públicas ya está en get_permission_maps,
    # por lo que si una ruta no está en el mapa, es una ruta protegida.
    permission_key = (method, path_template)
    if permission_key not in permission_map_cache:
        # Si la ruta no está en el mapa, puede ser una ruta pública que no hemos filtrado
        # o una ruta que no debería existir. Por defecto, si no hay un permiso definido,
        # se permite el acceso solo con autenticación.
        # El endpoint de modules es un caso especial que solo requiere login.
        if path_template == "/administracion/modules":
             return current_user
        raise HTTPException(status_code=404, detail=f"Endpoint not found or no permissions defined for: {method} {path_template}")

    required_ruta, required_funcion = permission_map_cache[permission_key]

    # Verificar el perfil del usuario
    user_perfil = await db.perfiles.find_one({"_id": current_user.perfil})
    if not user_perfil:
        raise HTTPException(status_code=403, detail="User profile not found")

    for modulo in user_perfil.get("modulos", []):
        if modulo.get("ruta") == required_ruta:
            for funcion in modulo.get("funciones", []):
                if funcion.get("nombre") == required_funcion:
                    return current_user  # ¡Permiso concedido!

    # Si el bucle termina sin encontrar el permiso, se deniega el acceso.
    raise HTTPException(status_code=403, detail=f"Operation '{required_funcion}' not permitted on resource '{required_ruta}'")