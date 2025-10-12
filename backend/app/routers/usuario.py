from datetime import timedelta
from fastapi import APIRouter, HTTPException, status

from app.schemas.usuario import Token, UsuarioCreate, LoginRequest
from app.services.usuario import get_user, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, create_user
from app.models.usuario import Usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=Token)
async def login_for_access_token(credentials: LoginRequest):
    user = await get_user(credentials.email)
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña o usuario incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/", response_model=Usuario)
async def add_user(user: UsuarioCreate):
    return await create_user(user)