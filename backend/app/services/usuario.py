import secrets
from fastapi import HTTPException, status
from datetime import datetime, date, timedelta
from bson import ObjectId
from typing import List, Optional

from app.database import db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, LoginRequest, Token, UsuarioUpdatePerfilSchema, ResetPasswordRequest
from app.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_user
from app.email import send_email

async def create_user(user: UsuarioCreate):
    # Check if username already exists
    if await db.usuarios.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["perfil"] = ObjectId(user.perfil)

    fecha_nac = user_dict["datos_personales"]["fecha_nacimiento"]
    if isinstance(fecha_nac, date) and not isinstance(fecha_nac, datetime):
        user_dict["datos_personales"]["fecha_nacimiento"] = datetime.combine(fecha_nac, datetime.min.time())

    result = await db.usuarios.insert_one(user_dict)
    created_user = await db.usuarios.find_one({"_id": result.inserted_id})
    return created_user

async def login_user(credentials: LoginRequest) -> Token:
    user = await get_user(credentials.username)
    if not user or not verify_password(credentials.password, user.password) or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña o usuario incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

async def get_all_users() -> List[Usuario]:
    """
    Obtiene todos los usuarios de la base de datos.
    """
    users = []
    async for user in db.usuarios.find():
        users.append(Usuario(**user))
    return users

async def assign_perfil_to_user(user_id: str, perfil_id: str) -> Optional[Usuario]:
    """
    Asigna un nuevo perfil a un usuario.
    """
    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(perfil_id):
        raise HTTPException(status_code=400, detail="ID de usuario o perfil inválido.")

    # Verificar que el perfil exista
    perfil = await db.perfiles.find_one({"_id": ObjectId(perfil_id)})
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    # Actualizar el usuario
    result = await db.usuarios.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"perfil": ObjectId(perfil_id)}}
    )

    if result.modified_count > 0:
        updated_user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        return Usuario(**updated_user)

    user_exists = await db.usuarios.find_one({"_id": ObjectId(user_id)})
    if not user_exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Si el usuario existe pero no se modificó, es porque el perfil ya era el mismo
    return Usuario(**user_exists)

async def update_user(user_id: str, user_update: "UsuarioUpdate") -> Optional[Usuario]:
    """
    Actualiza los datos de un usuario.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID de usuario inválido.")

    update_data = user_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar.")

    if "perfil" in update_data and update_data["perfil"]:
        if not ObjectId.is_valid(update_data["perfil"]):
            raise HTTPException(status_code=400, detail="ID de perfil inválido.")
        update_data["perfil"] = ObjectId(update_data["perfil"])

    if "datos_personales" in update_data and "fecha_nacimiento" in update_data["datos_personales"]:
        fecha_nac = update_data["datos_personales"]["fecha_nacimiento"]
        if isinstance(fecha_nac, date) and not isinstance(fecha_nac, datetime):
            update_data["datos_personales"]["fecha_nacimiento"] = datetime.combine(fecha_nac, datetime.min.time())

    result = await db.usuarios.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.modified_count > 0:
        updated_user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        return Usuario(**updated_user)

    user_exists = await db.usuarios.find_one({"_id": ObjectId(user_id)})
    if not user_exists:
         raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return Usuario(**user_exists)

async def toggle_user_active_status(user_id: str) -> Optional[Usuario]:
    """
    Activa o desactiva un usuario.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID de usuario inválido.")

    user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_status = not user.get("activo", False)

    result = await db.usuarios.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"activo": new_status}}
    )

    if result.modified_count > 0:
        updated_user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        return Usuario(**updated_user)

    return Usuario(**user)

async def request_password_reset(email: str):
    user_data = await db.usuarios.find_one({"username": email})
    if not user_data:
        # No revelamos si el usuario existe o no por seguridad
        return

    user = Usuario(**user_data)

    # Generar token
    token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(minutes=15)

    await db.usuarios.update_one(
        {"_id": user.id},
        {"$set": {"reset_password_token": token, "reset_password_token_expiration": expiration}}
    )

    # Enviar correo
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    html_content = f"""
    <html>
        <body>
            <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                <img src="https://i.imgur.com/a/IVW5LwH.jpg" alt="BlockAnalyzer Logo" style="width: 150px; margin-bottom: 20px;">
                <h2>Recuperación de Contraseña</h2>
                <p>Hola {user.datos_personales.nombre} {user.datos_personales.apellido},</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz clic en el siguiente enlace para continuar:</p>
                <a href="{reset_link}" style="background-color: #166534; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                    Restablecer Contraseña
                </a>
                <p style="margin-top: 20px;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
                <p style="font-size: 0.8em; color: #777;">Este enlace expirará en 15 minutos.</p>
            </div>
        </body>
    </html>
    """
    await send_email(
        to_email=user.username,
        subject="Restablece tu contraseña de BlockAnalyzer",
        html_content=html_content
    )

async def reset_password(request: ResetPasswordRequest):
    user_data = await db.usuarios.find_one({
        "reset_password_token": request.token,
        "reset_password_token_expiration": {"$gt": datetime.utcnow()}
    })

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token es inválido o ha expirado."
        )

    user = Usuario(**user_data)
    hashed_password = get_password_hash(request.new_password)

    await db.usuarios.update_one(
        {"_id": user.id},
        {
            "$set": {"password": hashed_password},
            "$unset": {"reset_password_token": "", "reset_password_token_expiration": ""}
        }
    )