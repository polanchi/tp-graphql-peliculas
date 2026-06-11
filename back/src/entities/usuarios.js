import { query } from "../db.js";
import { GraphQLError } from "graphql";
import { hashPassword, verifyPassword, signToken, requireAuth } from "../auth.js";
import { avatarUrl, guardarAvatar } from "../uploads.js";

export const usuariosTypeDefs = `#graphql
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    bio: String
    avatar: String
    rol: Rol!
    comentarios: [Comentario!]!
    calificaciones: [Calificacion!]!
    cantidadComentarios: Int!
    cantidadCalificaciones: Int!
  }

  type AuthPayload {
    token: String!
    usuario: Usuario!
  }

  extend type Query {
    usuarios: [Usuario]
    usuario(id: ID!): Usuario
    me: Usuario
  }

  extend type Mutation {
    registrar(nombre: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    actualizarPerfil(nombre: String, bio: String, avatar: String): Usuario!
  }
`;

const SELECT_USUARIO =
  'SELECT id, nombre, email, bio, avatar, rol_id AS "rolId" FROM usuarios';

export const usuariosResolvers = {
  Query: {
    usuarios: async () => {
      const result = await query(`${SELECT_USUARIO} ORDER BY id`);
      return result.rows;
    },
    usuario: async (_, { id }) => {
      const result = await query(`${SELECT_USUARIO} WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },
    me: (_, __, context) => context.usuario || null,
  },
  Mutation: {
    registrar: async (_, { nombre, email, password }) => {
      const emailNormalizado = email.trim().toLowerCase();
      if (!nombre.trim()) {
        throw new GraphQLError("El nombre es obligatorio.");
      }
      if (password.length < 6) {
        throw new GraphQLError("La contraseña debe tener al menos 6 caracteres.");
      }

      const existe = await query("SELECT id FROM usuarios WHERE email = $1", [emailNormalizado]);
      if (existe.rows[0]) {
        throw new GraphQLError("Ya existe un usuario con ese email.");
      }

      const passwordHash = await hashPassword(password);
      // Todos los registros públicos quedan con el rol "usuario".
      const result = await query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
         VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = 'usuario'))
         RETURNING id, nombre, email, bio, avatar, rol_id AS "rolId"`,
        [nombre.trim(), emailNormalizado, passwordHash]
      );
      const usuario = result.rows[0];
      return { token: signToken(usuario), usuario };
    },
    login: async (_, { email, password }) => {
      const emailNormalizado = email.trim().toLowerCase();
      const result = await query(
        `SELECT id, nombre, email, bio, avatar, password_hash AS "passwordHash", rol_id AS "rolId"
         FROM usuarios WHERE email = $1`,
        [emailNormalizado]
      );
      const usuario = result.rows[0];
      if (!usuario || !(await verifyPassword(password, usuario.passwordHash))) {
        throw new GraphQLError("Email o contraseña incorrectos.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      delete usuario.passwordHash;
      return { token: signToken(usuario), usuario };
    },
    actualizarPerfil: async (_, { nombre, bio, avatar }, context) => {
      const actual = requireAuth(context);
      const avatarRelativo = avatar ? await guardarAvatar(avatar) : null;
      const result = await query(
        `UPDATE usuarios
         SET nombre = COALESCE($1, nombre), bio = COALESCE($2, bio), avatar = COALESCE($3, avatar)
         WHERE id = $4
         RETURNING id, nombre, email, bio, avatar, rol_id AS "rolId"`,
        [nombre ?? null, bio ?? null, avatarRelativo, actual.id]
      );
      return result.rows[0];
    },
  },
  Usuario: {
    avatar: (usuario) => avatarUrl(usuario.avatar),
    rol: async (usuario) => {
      const result = await query("SELECT id, nombre FROM roles WHERE id = $1", [usuario.rolId]);
      return result.rows[0] || null;
    },
    comentarios: async (usuario) => {
      const result = await query(
        `SELECT id, texto, usuario_id AS "usuarioId", pelicula_id AS "peliculaId", creado_en AS "creadoEn"
         FROM comentarios WHERE usuario_id = $1 ORDER BY creado_en DESC`,
        [usuario.id]
      );
      return result.rows;
    },
    calificaciones: async (usuario) => {
      const result = await query(
        `SELECT id, estrellas, usuario_id AS "usuarioId", pelicula_id AS "peliculaId", creado_en AS "creadoEn"
         FROM calificaciones WHERE usuario_id = $1 ORDER BY creado_en DESC`,
        [usuario.id]
      );
      return result.rows;
    },
    cantidadComentarios: async (usuario) => {
      const result = await query("SELECT COUNT(*)::int AS total FROM comentarios WHERE usuario_id = $1", [usuario.id]);
      return result.rows[0].total;
    },
    cantidadCalificaciones: async (usuario) => {
      const result = await query("SELECT COUNT(*)::int AS total FROM calificaciones WHERE usuario_id = $1", [usuario.id]);
      return result.rows[0].total;
    },
  },
};
