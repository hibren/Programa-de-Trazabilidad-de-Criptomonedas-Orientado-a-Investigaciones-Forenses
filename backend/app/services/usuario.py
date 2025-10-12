from fastapi import HTTPException, status
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from typing import Optional

from app.database import db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT
SECRET_KEY = "LaClaveSecreta$754392047529394485" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(username: str):
    user = await db.usuarios.find_one({"username": username})
    if user:
        return Usuario(**user)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def create_user(user: UsuarioCreate):
    hashed_password = get_password_hash(user.password)
    # Use model_dump to convert the Pydantic model to a dict
    user_dict = user.model_dump()

    # Replace the password with the hashed one
    user_dict["password"] = hashed_password
    # IMPORTANT: model_dump() converts the ObjectId to a string.
    # We put the actual ObjectId back before inserting into MongoDB.
    user_dict["perfil"] = user.perfil

    # Convert date to datetime if necessary before inserting into DB
    fecha_nac = user_dict["datos_personales"]["fecha_nacimiento"]
    if isinstance(fecha_nac, date) and not isinstance(fecha_nac, datetime):
        user_dict["datos_personales"]["fecha_nacimiento"] = datetime.combine(fecha_nac, datetime.min.time())

    new_user = await db.usuarios.insert_one(user_dict)
    created_user = await db.usuarios.find_one({"_id": new_user.inserted_id})
    return created_user