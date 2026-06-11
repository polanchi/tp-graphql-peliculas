#!/usr/bin/env bash
# Arranque de CineSocial en Render.
# Arranca PostgreSQL dentro del mismo contenedor y luego la app Node.
# Pensado para una imagen autocontenida (no necesita una base externa).
set -e

PG_BIN="$(ls -d /usr/lib/postgresql/*/bin | head -1)"
export PATH="$PG_BIN:$PATH"

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PG_SOCKET_DIR="/var/run/postgresql"

# Asegura el directorio de datos con el dueño correcto.
mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# Directorio del socket Unix (PostgreSQL no usará TCP).
mkdir -p "$PG_SOCKET_DIR"
chown postgres:postgres "$PG_SOCKET_DIR"

# Inicializa el cluster la primera vez (si el volumen está vacío).
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[entrypoint] Inicializando cluster PostgreSQL en $PGDATA..."
  su postgres -c "$PG_BIN/initdb -D '$PGDATA' --auth-local=trust --auth-host=trust"
  # Confía en conexiones locales (suficiente para una imagen autocontenida).
  {
    echo "host all all 127.0.0.1/32 trust"
    echo "host all all ::1/128 trust"
  } >> "$PGDATA/pg_hba.conf"
fi

# Arranca PostgreSQL SOLO por socket Unix (sin TCP), así Render no confunde
# el puerto 5432 con el puerto web de la app.
echo "[entrypoint] Arrancando PostgreSQL (solo socket Unix)..."
su postgres -c "$PG_BIN/pg_ctl -D '$PGDATA' -o \"-c listen_addresses='' -c unix_socket_directories='$PG_SOCKET_DIR'\" -w start"

# Conexión de bootstrap como superusuario postgres (ignora los PG* de la app,
# que apuntan a un rol/base que recién vamos a crear).
PSQL_ADMIN="psql -U postgres -d postgres"

# Crea el rol y la base de la app si todavía no existen.
if ! su postgres -c "$PSQL_ADMIN -tAc \"SELECT 1 FROM pg_roles WHERE rolname='interfaces-gq'\"" | grep -q 1; then
  echo "[entrypoint] Creando rol interfaces-gq..."
  su postgres -c "$PSQL_ADMIN -c \"CREATE ROLE \\\"interfaces-gq\\\" LOGIN PASSWORD 'interfaces-gq'\""
fi

if ! su postgres -c "$PSQL_ADMIN -tAc \"SELECT 1 FROM pg_database WHERE datname='interfaces-gq'\"" | grep -q 1; then
  echo "[entrypoint] Creando base interfaces-gq..."
  su postgres -c "$PSQL_ADMIN -c \"CREATE DATABASE \\\"interfaces-gq\\\" OWNER \\\"interfaces-gq\\\"\""
fi

# Arranca la app (ejecuta init.sql automáticamente al iniciar).
echo "[entrypoint] Arrancando la aplicación Node..."
cd /app/back
exec node server.js
