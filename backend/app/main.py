# app/main.py
from fastapi import FastAPI
from app.routers import direccion, bloque, transaccion, reporte, cluster
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Trazabilidad de Criptomonedas", version="1.0.0")

# CORS configuration - ADD THIS BEFORE ANY ROUTES
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers AFTER CORS middleware
app.include_router(direccion.router)
app.include_router(bloque.router)
app.include_router(transaccion.router)
app.include_router(reporte.router)
app.include_router(cluster.router)

@app.get("/")
async def root():
    return {"message": "API de Trazabilidad de Criptomonedas"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}