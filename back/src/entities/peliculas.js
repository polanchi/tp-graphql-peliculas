import { query } from "../db.js";
import { requireAdmin, requireAuth } from "../auth.js";
import { guardarPoster, eliminarPoster, posterUrl } from "../uploads.js";

export const peliculasTypeDefs = `#graphql
  type Pelicula {
    id: ID!
    titulo: String!
    anio: Int!
    genero: String!
    poster: String
    director: Director!
    comentarios: [Comentario!]!
    cantidadComentarios: Int!
    promedioEstrellas: Float!
    cantidadVotos: Int!
    miCalificacion: Int
    cantidadLikes: Int!
    meGusta: Boolean!
  }

  extend type Query {
    "Lista de películas con búsqueda y filtros opcionales."
    peliculas(busqueda: String, genero: String, directorId: ID, ordenarPor: OrdenPelicula): [Pelicula]
    pelicula(id: ID!): Pelicula
    generos: [String!]!
  }

  enum OrdenPelicula {
    TITULO
    ANIO
    MEJOR_PUNTUADAS
    MAS_COMENTADAS
  }

  extend type Mutation {
    "El poster se envía como Data URL en base64 (la imagen real, no un enlace)."
    agregarPelicula(titulo: String!, anio: Int!, genero: String!, directorId: ID!, poster: String): Pelicula
    eliminarPelicula(id: ID!): Boolean!
    toggleLikePelicula(peliculaId: ID!): Pelicula!
  }
`;

const SELECT_PELICULA =
  'SELECT id, titulo, anio, genero, poster, director_id AS "directorId" FROM peliculas';

const ORDEN_SQL = {
  TITULO: "p.titulo ASC",
  ANIO: "p.anio DESC",
  MEJOR_PUNTUADAS: "COALESCE(AVG(c.estrellas), 0) DESC, p.titulo ASC",
  MAS_COMENTADAS: "COUNT(DISTINCT com.id) DESC, p.titulo ASC",
};

export const peliculasResolvers = {
  Query: {
    peliculas: async (_, { busqueda, genero, directorId, ordenarPor }) => {
      const condiciones = [];
      const params = [];

      if (busqueda && busqueda.trim()) {
        params.push(`%${busqueda.trim()}%`);
        condiciones.push(`p.titulo ILIKE $${params.length}`);
      }
      if (genero && genero.trim()) {
        params.push(genero.trim());
        condiciones.push(`p.genero = $${params.length}`);
      }
      if (directorId) {
        params.push(directorId);
        condiciones.push(`p.director_id = $${params.length}`);
      }

      const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
      const orden = ORDEN_SQL[ordenarPor] || "p.id ASC";

      const result = await query(
        `SELECT p.id, p.titulo, p.anio, p.genero, p.poster, p.director_id AS "directorId"
         FROM peliculas p
         LEFT JOIN calificaciones c ON c.pelicula_id = p.id
         LEFT JOIN comentarios com ON com.pelicula_id = p.id
         ${where}
         GROUP BY p.id
         ORDER BY ${orden}`,
        params
      );
      return result.rows;
    },
    pelicula: async (_, { id }) => {
      const result = await query(`${SELECT_PELICULA} WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },
    generos: async () => {
      const result = await query("SELECT nombre FROM generos ORDER BY nombre");
      return result.rows.map((r) => r.nombre);
    },
  },
  Mutation: {
    agregarPelicula: async (_, { titulo, anio, genero, directorId, poster }, context) => {
      requireAdmin(context);
      const generoValido = await query("SELECT 1 FROM generos WHERE nombre = $1", [genero]);
      if (!generoValido.rows[0]) {
        throw new Error("Género inválido. Elegí uno de la lista de géneros disponibles.");
      }
      // Si llega una imagen, la guardamos en disco y conservamos su ruta relativa.
      const posterPath = poster ? await guardarPoster(poster) : null;
      const result = await query(
        `INSERT INTO peliculas (titulo, anio, genero, director_id, poster)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, titulo, anio, genero, poster, director_id AS "directorId"`,
        [titulo, anio, genero, directorId, posterPath]
      );
      return result.rows[0];
    },
    eliminarPelicula: async (_, { id }, context) => {
      requireAdmin(context);
      // Recuperamos el poster para borrar también el archivo del disco.
      const previa = await query("SELECT poster FROM peliculas WHERE id = $1", [id]);
      await query("DELETE FROM peliculas WHERE id = $1", [id]);
      if (previa.rows[0]?.poster) {
        await eliminarPoster(previa.rows[0].poster);
      }
      return true;
    },
    toggleLikePelicula: async (_, { peliculaId }, context) => {
      const usuario = requireAuth(context);
      const yaDio = await query(
        "SELECT 1 FROM pelicula_likes WHERE usuario_id = $1 AND pelicula_id = $2",
        [usuario.id, peliculaId]
      );
      if (yaDio.rows[0]) {
        await query("DELETE FROM pelicula_likes WHERE usuario_id = $1 AND pelicula_id = $2", [
          usuario.id,
          peliculaId,
        ]);
      } else {
        await query("INSERT INTO pelicula_likes (usuario_id, pelicula_id) VALUES ($1, $2)", [
          usuario.id,
          peliculaId,
        ]);
      }
      const result = await query(`${SELECT_PELICULA} WHERE id = $1`, [peliculaId]);
      return result.rows[0];
    },
  },
  Pelicula: {
    poster: (pelicula) => posterUrl(pelicula.poster),
    director: async (pelicula) => {
      const result = await query("SELECT id, nombre FROM directores WHERE id = $1", [pelicula.directorId]);
      return result.rows[0] || null;
    },
    comentarios: async (pelicula) => {
      const result = await query(
        `SELECT id, texto, usuario_id AS "usuarioId", pelicula_id AS "peliculaId", creado_en AS "creadoEn"
         FROM comentarios WHERE pelicula_id = $1 ORDER BY creado_en DESC`,
        [pelicula.id]
      );
      return result.rows;
    },
    cantidadComentarios: async (pelicula) => {
      const result = await query("SELECT COUNT(*)::int AS total FROM comentarios WHERE pelicula_id = $1", [
        pelicula.id,
      ]);
      return result.rows[0].total;
    },
    promedioEstrellas: async (pelicula) => {
      const result = await query(
        "SELECT COALESCE(AVG(estrellas), 0)::float AS promedio FROM calificaciones WHERE pelicula_id = $1",
        [pelicula.id]
      );
      return Math.round(result.rows[0].promedio * 10) / 10;
    },
    cantidadVotos: async (pelicula) => {
      const result = await query("SELECT COUNT(*)::int AS total FROM calificaciones WHERE pelicula_id = $1", [
        pelicula.id,
      ]);
      return result.rows[0].total;
    },
    miCalificacion: async (pelicula, _, context) => {
      if (!context.usuario) return null;
      const result = await query(
        "SELECT estrellas FROM calificaciones WHERE pelicula_id = $1 AND usuario_id = $2",
        [pelicula.id, context.usuario.id]
      );
      return result.rows[0] ? result.rows[0].estrellas : null;
    },
    cantidadLikes: async (pelicula) => {
      const result = await query("SELECT COUNT(*)::int AS total FROM pelicula_likes WHERE pelicula_id = $1", [
        pelicula.id,
      ]);
      return result.rows[0].total;
    },
    meGusta: async (pelicula, _, context) => {
      if (!context.usuario) return false;
      const result = await query(
        "SELECT 1 FROM pelicula_likes WHERE pelicula_id = $1 AND usuario_id = $2",
        [pelicula.id, context.usuario.id]
      );
      return Boolean(result.rows[0]);
    },
  },
};
