import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración del servidor
// En Render (y la mayoría de PaaS) el puerto llega por la variable de entorno PORT.
export const PORT = Number(process.env.PORT) || 4000;
export const LISTEN_OPTIONS = {
  listen: { port: PORT },
};

// Configuración del almacenamiento de imágenes (posters de películas)
// Las imágenes se guardan en disco dentro de back/images/peliculas
// y se sirven desde el mismo servidor bajo la ruta /images.
export const IMAGES_ROUTE = "/images";
// Como el frontend y el backend se sirven desde el mismo origen (una sola imagen
// Docker), usamos una URL relativa para que funcione en cualquier dominio (Render,
// localhost, etc.). Si se quisiera servir desde otro host, basta con definir
// PUBLIC_BASE_URL (por ej. "http://localhost:4000").
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "";
export const IMAGES_BASE_URL = `${PUBLIC_BASE_URL}${IMAGES_ROUTE}`;
// back/src -> back  => back/images
export const IMAGES_DIR = path.resolve(__dirname, "..", "images");
export const POSTERS_SUBDIR = "peliculas";
export const POSTERS_DIR = path.join(IMAGES_DIR, POSTERS_SUBDIR);

// Configuración de la base de datos Postgres.
// En Render se inyecta DATABASE_URL (cadena de conexión completa). En desarrollo
// local se usan las credenciales por defecto o las variables PG* estándar.
const usarConnectionString = !!process.env.DATABASE_URL;
export const DB_CONFIG = usarConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      // Render exige SSL en conexiones externas. Se puede desactivar con DATABASE_SSL=false.
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      user: process.env.PGUSER || "interfaces-gq",
      password: process.env.PGPASSWORD || "interfaces-gq",
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || "interfaces-gq",
    };

// Configuración de autenticación (JWT)
// En producción esto debería venir de una variable de entorno.
export const JWT_SECRET = process.env.JWT_SECRET || "cambia-este-secreto-en-produccion";
export const JWT_EXPIRES_IN = "7d";

