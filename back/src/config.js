import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración del servidor
export const PORT = 4000;
export const LISTEN_OPTIONS = {
  listen: { port: PORT },
};

// Configuración del almacenamiento de imágenes (posters de películas)
// Las imágenes se guardan en disco dentro de back/images/peliculas
// y se sirven desde el mismo servidor (puerto 4000) bajo la ruta /images.
export const IMAGES_ROUTE = "/images";
export const IMAGES_BASE_URL = `http://localhost:${PORT}${IMAGES_ROUTE}`;
// back/src -> back  => back/images
export const IMAGES_DIR = path.resolve(__dirname, "..", "images");
export const POSTERS_SUBDIR = "peliculas";
export const POSTERS_DIR = path.join(IMAGES_DIR, POSTERS_SUBDIR);

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

