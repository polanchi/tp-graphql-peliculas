import { query } from "../db.js";
import { GraphQLError } from "graphql";
import { requireAuth } from "../auth.js";

export const comentariosTypeDefs = `#graphql
  type Comentario {
    id: ID!
    texto: String!
    creadoEn: String!
    usuario: Usuario!
    pelicula: Pelicula!
    cantidadLikes: Int!
    meGusta: Boolean!
  }

  extend type Mutation {
    agregarComentario(peliculaId: ID!, texto: String!): Comentario!
    eliminarComentario(id: ID!): Boolean!
    toggleLikeComentario(comentarioId: ID!): Comentario!
  }
`;

const SELECT_COMENTARIO =
  'SELECT id, texto, usuario_id AS "usuarioId", pelicula_id AS "peliculaId", creado_en AS "creadoEn" FROM comentarios';

export const comentariosResolvers = {
  Mutation: {
    agregarComentario: async (_, { peliculaId, texto }, context) => {
      const usuario = requireAuth(context);
      if (!texto.trim()) {
        throw new GraphQLError("El comentario no puede estar vacío.");
      }
      const result = await query(
        `INSERT INTO comentarios (texto, usuario_id, pelicula_id)
         VALUES ($1, $2, $3)
         RETURNING id, texto, usuario_id AS "usuarioId", pelicula_id AS "peliculaId", creado_en AS "creadoEn"`,
        [texto.trim(), usuario.id, peliculaId]
      );
      return result.rows[0];
    },
    eliminarComentario: async (_, { id }, context) => {
      const usuario = requireAuth(context);
      const result = await query(`${SELECT_COMENTARIO} WHERE id = $1`, [id]);
      const comentario = result.rows[0];
      if (!comentario) {
        throw new GraphQLError("El comentario no existe.");
      }
      const esAutor = String(comentario.usuarioId) === String(usuario.id);
      const esAdmin = usuario.rolNombre === "admin";
      if (!esAutor && !esAdmin) {
        // Un editor o admin puede moderar; el resto solo borra lo suyo.
        if (usuario.rolNombre !== "editor") {
          throw new GraphQLError("No tenés permiso para borrar este comentario.", {
            extensions: { code: "FORBIDDEN" },
          });
        }
      }
      await query("DELETE FROM comentarios WHERE id = $1", [id]);
      return true;
    },
    toggleLikeComentario: async (_, { comentarioId }, context) => {
      const usuario = requireAuth(context);
      const yaDio = await query(
        "SELECT 1 FROM comentario_likes WHERE usuario_id = $1 AND comentario_id = $2",
        [usuario.id, comentarioId]
      );
      if (yaDio.rows[0]) {
        await query("DELETE FROM comentario_likes WHERE usuario_id = $1 AND comentario_id = $2", [
          usuario.id,
          comentarioId,
        ]);
      } else {
        await query("INSERT INTO comentario_likes (usuario_id, comentario_id) VALUES ($1, $2)", [
          usuario.id,
          comentarioId,
        ]);
      }
      const result = await query(`${SELECT_COMENTARIO} WHERE id = $1`, [comentarioId]);
      return result.rows[0];
    },
  },
  Comentario: {
    usuario: async (comentario) => {
      const result = await query(
        'SELECT id, nombre, email, bio, rol_id AS "rolId" FROM usuarios WHERE id = $1',
        [comentario.usuarioId]
      );
      return result.rows[0] || null;
    },
    pelicula: async (comentario) => {
      const result = await query(
        'SELECT id, titulo, anio, genero, director_id AS "directorId" FROM peliculas WHERE id = $1',
        [comentario.peliculaId]
      );
      return result.rows[0] || null;
    },
    cantidadLikes: async (comentario) => {
      const result = await query(
        "SELECT COUNT(*)::int AS total FROM comentario_likes WHERE comentario_id = $1",
        [comentario.id]
      );
      return result.rows[0].total;
    },
    meGusta: async (comentario, _, context) => {
      if (!context.usuario) return false;
      const result = await query(
        "SELECT 1 FROM comentario_likes WHERE comentario_id = $1 AND usuario_id = $2",
        [comentario.id, context.usuario.id]
      );
      return Boolean(result.rows[0]);
    },
  },
};
