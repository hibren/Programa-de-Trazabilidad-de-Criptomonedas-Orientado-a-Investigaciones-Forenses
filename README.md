Programa de Trazabilidad de Criptomonedas












🔍 Seguimiento del Dinero en Criptomonedas en Diferentes Exchanges

Este proyecto es un Programa de Trazabilidad de Criptomonedas orientado a investigaciones forenses. Permite a peritos, fiscales e investigadores rastrear movimientos de criptomonedas y analizar transacciones asociadas a direcciones y clusters.

📂 Estructura del Proyecto
Programa-de-Trazabilidad-de-Criptomonedas/
 ├── backend/        # FastAPI + MongoDB
 │   ├── main.py
 │   ├── requirements.txt
 │   └── Dockerfile
 ├── frontend/       # Next.js + TailwindCSS
 │   ├── src/
 │   ├── package.json
 │   └── Dockerfile
 └── docker-compose.yml

🛠 Tecnologías

Frontend: Next.js, React, TailwindCSS

Backend: FastAPI, Pydantic, Motor (MongoDB Async Driver)

Base de datos: MongoDB (Docker)

Orquestación: Docker + Docker Compose

Extras: ESLint, Prettier

⚡ Requisitos

Node.js
 ≥18

Python
 ≥3.10

Docker
 y Docker Compose

pip y npm

🚀 Levantar el Proyecto
1️⃣ Con Docker (recomendado)

Desde la raíz del proyecto:

docker compose up -d --build


Backend: http://localhost:8000

Documentación FastAPI: http://localhost:8000/docs

Frontend: http://localhost:3000

MongoDB: mongodb://localhost:27017

2️⃣ Sin Docker (desarrollo rápido)
Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate   # Windows
# source venv/bin/activate # Linux/Mac

pip install -r requirements.txt
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm run dev

🔗 Conexión Frontend ↔ Backend

En desarrollo, el frontend hace fetch a http://localhost:8000.

Para producción, usar variable de entorno NEXT_PUBLIC_API_URL.

Ejemplo .env.local en Next.js:

NEXT_PUBLIC_API_URL=http://localhost:8000

📌 Buenas Prácticas

Mantener ESLint activo para código limpio.

Integrar Prettier para formateo automático.

Separar el código en src/ para mayor organización.

Usar MongoDB en Docker para consistencia y fácil despliegue.

📝 Notas

La primera vez que levantás Docker Compose, puede tardar unos minutos en descargar imágenes (mongo, node, etc.).

La advertencia de Cross origin request en desarrollo es normal y no rompe nada.

Se recomienda usar Next.js fuera de Docker en desarrollo para aprovechar hot reload.
