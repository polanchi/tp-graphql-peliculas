import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { JWT_SECRET, JWT_EXPIRES_IN } from "./config.js";
import { query } from "./db.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(usuario) {
  return jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Devuelve el usuario (con su rol) a partir del token, o null si no es válido.
export async function getUsuarioFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await query(
      `SELECT u.id, u.nombre, u.email, u.bio, u.rol_id AS "rolId", r.nombre AS "rolNombre"
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = $1`,
      [payload.id]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

// Construye el context de Apollo a partir del header Authorization.
export async function buildContext({ req }) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  const usuario = await getUsuarioFromToken(token);
  return { usuario };
}

// Helpers para usar dentro de los resolvers
export function requireAuth(context) {
  if (!context.usuario) {
    throw new GraphQLError("Debés iniciar sesión para realizar esta acción.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.usuario;
}

export function requireAdmin(context) {
  const usuario = requireAuth(context);
  if (usuario.rolNombre !== "admin") {
    throw new GraphQLError("Solo los administradores pueden realizar esta acción.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return usuario;
}
