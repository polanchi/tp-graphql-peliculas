import { query } from "../db.js";
import { GraphQLError } from "graphql";
import { requireAuth } from "../auth.js";

export const calificacionesTypeDefs = `#graphql
  type Calificacion {
    id: ID!
    estrellas: Int!
    creadoEn: String!
    usuario: Usuario!
    pelicula: Pelicula!
  }

  extend type Mutation {
    calificarPelicula(peliculaId: ID!, estrellas: Int!): Pelicula!
  }
`;

export const calificacionesResolvers = {
  Mutation: {
    calificarPelicula: async (_, { peliculaId, estrellas }, context) => {
      const usuario = requireAuth(context);
      if (estrellas < 1 || estrellas > 5) {
        throw new GraphQLError("La calificación debe ser entre 1 y 5 estrellas.");
      }
      // Upsert: un voto por usuario y película; si vuelve a votar, se actualiza.
      await query(
        `INSERT INTO calificaciones (estrellas, usuario_id, pelicula_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (usuario_id, pelicula_id)
         DO UPDATE SET estrellas = EXCLUDED.estrellas, creado_en = NOW()`,
        [estrellas, usuario.id, peliculaId]
      );
      const result = await query(
        'SELECT id, titulo, anio, genero, director_id AS "directorId" FROM peliculas WHERE id = $1',
        [peliculaId]
      );
      return result.rows[0];
    },
  },
  Calificacion: {
    usuario: async (calificacion) => {
      const result = await query(
        'SELECT id, nombre, email, bio, avatar, rol_id AS "rolId" FROM usuarios WHERE id = $1',
        [calificacion.usuarioId]
      );
      return result.rows[0] || null;
    },
    pelicula: async (calificacion) => {
      const result = await query(
        'SELECT id, titulo, anio, genero, director_id AS "directorId" FROM peliculas WHERE id = $1',
        [calificacion.peliculaId]
      );
      return result.rows[0] || null;
    },
  },
};
