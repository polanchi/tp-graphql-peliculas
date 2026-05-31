# Imagen única que sirve el backend GraphQL + el frontend estático + las imágenes.
FROM node:20-alpine

WORKDIR /app

# 1) Instalar solo las dependencias del backend (mejor uso de la cache de Docker).
COPY back/package.json back/package-lock.json ./back/
RUN cd back && npm ci --omit=dev

# 2) Copiar el código del backend y del frontend.
COPY back ./back
COPY front ./front

ENV NODE_ENV=production
# PORT lo inyecta Render; 4000 es el valor por defecto para uso local.
ENV PORT=4000
EXPOSE 4000

WORKDIR /app/back
CMD ["node", "server.js"]
