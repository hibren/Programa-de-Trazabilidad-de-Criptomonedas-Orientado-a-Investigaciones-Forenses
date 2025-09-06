# 🔍 Programa de Trazabilidad de Criptomonedas Orientado a Investigaciones Forenses


Este proyecto consiste en el desarrollo de un **Programa de Trazabilidad de Criptomonedas** orientado a investigaciones forenses.  
Su objetivo principal es permitir a **peritos, fiscales e investigadores** rastrear y analizar transacciones de criptomonedas a través de **blockchains públicas y exchanges centralizados**, con el fin de identificar posibles patrones de riesgo relacionados con **lavado de dinero, ciberdelitos u otras actividades ilícitas**.

---

## 📌 Tipo de sistema a desarrollar

El sistema a desarrollar es una **herramienta de trazabilidad y análisis forense** que:

- Utiliza **APIs de blockchain** (ej: BlockCypher para Bitcoin) y **APIs de exchanges autorizados** para extraer información de transacciones, balances y flujos de fondos.
- Permite seguir el rastro de cada transacción, revisando los outputs y clasificándolos según su destino:
  - Exchanges conocidos
  - Mixers
  - Direcciones sospechosas
  - Nuevas direcciones
- Incorpora un **modelo de análisis de riesgo** que asigna puntajes a direcciones y transacciones utilizando:
  - Criterios técnicos  
  - Listas de sancionados  
  - OSINT  
  - Patrones de transacciones inusuales  

---

## 🛠️ Tecnologías a aplicar

- **Base de datos NoSQL (MongoDB en Docker):**  
  Para almacenar información de transacciones, direcciones, scores de riesgo y reportes, con consultas rápidas sobre grandes volúmenes de datos.

- **Next.js + React + Tailwind CSS:**  
  Desarrollo del **frontend** para interfaces modernas, interactivas y responsive.

- **FastAPI:**  
  Framework del **backend** para exponer APIs rápidas y seguras, gestionar la extracción de datos desde blockchains y exchanges, calcular puntajes de riesgo y generar informes.

- **Docker + Docker Compose:**  
  Para levantar MongoDB, Backend y Frontend de manera orquestada y reproducible.

---

## 📊 Resultados esperados

- Seguimiento detallado de transacciones en diferentes blockchains y exchanges.  
- Identificación de patrones sospechosos y cálculo de riesgo.  
- Reportes forenses completos, con grafos, líneas de tiempo y tablas.  
- Sistema auditable y con validez judicial para investigaciones.  

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Clonar este repositorio

git clone https://github.com/tuusuario/Seguimiento-del-dinero-criptomonedas-en-diferentes-exchanges.git
cd Seguimiento-del-dinero-criptomonedas-en-diferentes-exchanges


### 2. Con Docker (recomendado)

Levantar todo junto (MongoDB + Backend + Frontend):

docker compose up -d --build

- Backend (FastAPI): http://localhost:8000
- Documentación FastAPI: http://localhost:8000/docs
- Frontend (Next.js): http://localhost:3000
- MongoDB: mongodb://localhost:27023

Docker manejará automáticamente volúmenes persistentes y dependencias.

### 3. Backend sin Docker (opcional para desarrollo)

📂 Entrar en la carpeta backend:

cd backend


📌 Crear un entorno virtual:

python -m venv venv
venv\Scripts\activate # Windows PowerShell


📌 Instalar dependencias:

pip install -r requirements.txt


📌 Ejecutar el servidor:

uvicorn main:app --reload


El backend quedará disponible en 👉 http://localhost:8000

Documentación interactiva en 👉 http://localhost:8000/docs

### 4. Frontend sin Docker (opcional para desarrollo)

📂 En otra terminal, entrar en la carpeta frontend:

cd frontend


📌 Instalar dependencias:

npm install


📌 Ejecutar el servidor de desarrollo:

npm run dev


El frontend quedará disponible en 👉 http://localhost:3000

Asegúrate de que la variable de entorno NEXT_PUBLIC_API_URL apunte al backend (http://localhost:8000).

### 📦 requirements.txt (backend)

El backend requiere las siguientes dependencias:

- fastapi

- uvicorn[standard]

- motor

- pydantic

- requests

### 💡 Notas

La primera vez que levantes Docker Compose puede tardar en descargar imágenes (mongo, node, etc.).

En desarrollo, usar frontend fuera de Docker permite hot reload y cambios instantáneos.

La advertencia de Cross origin request en desarrollo es normal si accedes desde otra IP y no rompe nada.
