from fastapi import FastAPI
from app.routers import direccion

app = FastAPI()

# Incluir el router
app.include_router(direccion.router)
