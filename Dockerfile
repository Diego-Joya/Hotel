FROM node:24-alpine

WORKDIR /app

# Copiar configuración de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción (así ahorramos espacio en la mini PC)
RUN npm ci --only=production

# Copiar todo el código fuente del Express
COPY . .

# Exponer el puerto interno en el que escucha tu Express (usualmente 3000)
EXPOSE 3000

# ⚠️ OJO: Cambia "index.js" por tu archivo de arranque real (puede ser app.js, server.js, etc.)
CMD ["node", "index.js"]