// Configuración del servidor
export const PORT = 4000;
export const LISTEN_OPTIONS = {
  listen: { port: PORT },
};

// Configuración de la base de datos Postgres
export const DB_CONFIG = {
  user: "interfaces-gq",
  password: "interfaces-gq",
  host: "localhost",
  port: 5432,
  database: "interfaces-gq",
};

// Configuración de autenticación (JWT)
// En producción esto debería venir de una variable de entorno.
export const JWT_SECRET = process.env.JWT_SECRET || "cambia-este-secreto-en-produccion";
export const JWT_EXPIRES_IN = "7d";

