# Imagen base oficial de Python (slim para que sea más liviana)
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (para aprovechar cache)
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 8000

# Comando para ejecutar el servidor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
