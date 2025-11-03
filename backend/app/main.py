# app/main.py
from fastapi import FastAPI
from app.routers import direccion, bloque, transaccion, reporte, cluster, analisis, relacion, usuario, perfiles, modules, patrones, trazabilidad, rastreo, alerta
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
app.include_router(direccion.router, prefix="")
app.include_router(bloque.router, prefix="")
app.include_router(transaccion.router, prefix="")
app.include_router(reporte.router, prefix="")
app.include_router(cluster.router, prefix="")
app.include_router(analisis.router, prefix="")
app.include_router(relacion.router, prefix="")
app.include_router(usuario.router)
app.include_router(perfiles.router)
app.include_router(modules.router)
app.include_router(patrones.router)
app.include_router(trazabilidad.router)
app.include_router(rastreo.router)
app.include_router(alerta.router)


@app.get("/")
async def root():
    return {"message": "API de Trazabilidad de Criptomonedas"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}