# app/main.py
from fastapi import FastAPI
from app.routers import direccion, bloque, transaccion, reporte

app = FastAPI(title="Trazabilidad de Criptomonedas", version="1.0.0")

# Incluir routers
app.include_router(direccion.router)
app.include_router(bloque.router)
app.include_router(transaccion.router)
app.include_router(reporte.router)

@app.get("/")
async def root():
    return {"message": "API de Trazabilidad de Criptomonedas"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}