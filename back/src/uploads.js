import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { GraphQLError } from "graphql";
import { IMAGES_DIR, IMAGES_BASE_URL, POSTERS_DIR, POSTERS_SUBDIR } from "./config.js";

// Extensiones permitidas según el tipo MIME de la imagen.
const MIME_EXTENSIONES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Asegura que las carpetas de imágenes existan al iniciar el servidor.
export async function asegurarCarpetasImagenes() {
  await fsp.mkdir(POSTERS_DIR, { recursive: true });
}

/**
 * Guarda en disco una imagen recibida como Data URL en base64
 * (por ej. "data:image/png;base64,iVBORw0KGgo...").
 * Devuelve la ruta relativa guardada (ej: "peliculas/abc123.png").
 */
export async function guardarPoster(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new GraphQLError("La imagen del poster no es válida.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    throw new GraphQLError(
      "Formato de imagen inválido. Subí un archivo de imagen real (no un enlace).",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  const mime = match[1].toLowerCase();
  const extension = MIME_EXTENSIONES[mime];
  if (!extension) {
    throw new GraphQLError(
      "Tipo de imagen no soportado. Usá JPG, PNG, WEBP, GIF o AVIF.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new GraphQLError("La imagen está vacía.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  await fsp.mkdir(POSTERS_DIR, { recursive: true });

  const nombreArchivo = `${crypto.randomUUID()}.${extension}`;
  const rutaAbsoluta = path.join(POSTERS_DIR, nombreArchivo);
  await fsp.writeFile(rutaAbsoluta, buffer);

  // Guardamos la ruta relativa para almacenarla en la base de datos.
  return `${POSTERS_SUBDIR}/${nombreArchivo}`;
}

// Borra del disco el poster correspondiente a una ruta relativa.
export async function eliminarPoster(rutaRelativa) {
  if (!rutaRelativa) return;
  const rutaAbsoluta = path.join(IMAGES_DIR, rutaRelativa);
  // Evita salir de la carpeta de imágenes (path traversal).
  if (!rutaAbsoluta.startsWith(IMAGES_DIR)) return;
  try {
    await fsp.unlink(rutaAbsoluta);
  } catch {
    // Si el archivo no existe, no hacemos nada.
  }
}

// Construye la URL pública para un poster guardado.
export function posterUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${IMAGES_BASE_URL}/${rutaRelativa}`;
}
