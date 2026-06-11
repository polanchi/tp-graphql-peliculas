import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { GraphQLError } from "graphql";
import {
  AVATARS_DIR,
  AVATARS_SUBDIR,
  IMAGES_DIR,
  IMAGES_BASE_URL,
  POSTERS_DIR,
  POSTERS_SUBDIR,
} from "./config.js";

const MIME_EXTENSIONES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function asegurarCarpetasImagenes() {
  await fsp.mkdir(POSTERS_DIR, { recursive: true });
  await fsp.mkdir(AVATARS_DIR, { recursive: true });
}

async function guardarImagen(dataUrl, carpetaDestino, subcarpeta, nombreCampo) {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new GraphQLError(`La imagen de ${nombreCampo} no es valida.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    throw new GraphQLError("Formato de imagen invalido. Subi un archivo de imagen real.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const mime = match[1].toLowerCase();
  const extension = MIME_EXTENSIONES[mime];
  if (!extension) {
    throw new GraphQLError("Tipo de imagen no soportado. Usa JPG, PNG, WEBP, GIF o AVIF.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new GraphQLError("La imagen esta vacia.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  await fsp.mkdir(carpetaDestino, { recursive: true });

  const nombreArchivo = `${crypto.randomUUID()}.${extension}`;
  const rutaAbsoluta = path.join(carpetaDestino, nombreArchivo);
  await fsp.writeFile(rutaAbsoluta, buffer);

  return `${subcarpeta}/${nombreArchivo}`;
}

export async function guardarPoster(dataUrl) {
  return guardarImagen(dataUrl, POSTERS_DIR, POSTERS_SUBDIR, "poster");
}

export async function guardarAvatar(dataUrl) {
  return guardarImagen(dataUrl, AVATARS_DIR, AVATARS_SUBDIR, "perfil");
}

export async function eliminarPoster(rutaRelativa) {
  await eliminarImagen(rutaRelativa);
}

export async function eliminarAvatar(rutaRelativa) {
  await eliminarImagen(rutaRelativa);
}

async function eliminarImagen(rutaRelativa) {
  if (!rutaRelativa) return;
  const rutaAbsoluta = path.join(IMAGES_DIR, rutaRelativa);
  if (!rutaAbsoluta.startsWith(IMAGES_DIR)) return;
  try {
    await fsp.unlink(rutaAbsoluta);
  } catch {
    // Si el archivo no existe, no hacemos nada.
  }
}

export function posterUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${IMAGES_BASE_URL}/${rutaRelativa}`;
}

export function avatarUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${IMAGES_BASE_URL}/${rutaRelativa}`;
}
