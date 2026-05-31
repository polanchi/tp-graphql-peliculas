# Imagen única y AUTOCONTENIDA: incluye el backend GraphQL, el frontend estático,
# las imágenes y la propia base de datos PostgreSQL dentro del mismo contenedor.
#
# NOTA: la base vive dentro del contenedor. En plataformas con disco efímero
# (como el plan gratuito de Render) los datos se reinician en cada redeploy y
# vuelven a los valores de init.sql. Para conservar datos, montá un disco
# persistente en /var/lib/postgresql/data o usá una base externa (DATABASE_URL).
FROM node:20-bookworm-slim

# PostgreSQL dentro de la misma imagen.
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Dependencias del backend (mejor uso de la cache de Docker).
COPY back/package.json back/package-lock.json ./back/
RUN cd back && npm ci --omit=dev

# 2) Código del backend y del frontend.
COPY back ./back
COPY front ./front

# 3) Script de arranque (levanta Postgres y luego la app).
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000
# La app se conecta a la base local incluida en la imagen.
ENV DATABASE_URL="postgres://interfaces-gq:interfaces-gq@127.0.0.1:5432/interfaces-gq"
ENV DATABASE_SSL=false
ENV PGDATA=/var/lib/postgresql/data

EXPOSE 4000

CMD ["/usr/local/bin/docker-entrypoint.sh"]
