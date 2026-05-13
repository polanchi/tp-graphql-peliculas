import { query } from "../db.js";

export const peliculasTypeDefs = `#graphql
  type Pelicula {
    id: ID!
    titulo: String!
    anio: Int!
    genero: String!
    director: Director!
  }

  extend type Query {
    peliculas: [Pelicula]
    pelicula(id: ID!): Pelicula
  }

  extend type Mutation {
    agregarPelicula(titulo: String!, anio: Int!, genero: String!, directorId: ID!): Pelicula
  }
`;

export const peliculasResolvers = {
  Query: {
    peliculas: async () => {
      const result = await query(
        "SELECT id, titulo, anio, genero, director_id AS \"directorId\" FROM peliculas ORDER BY id"
      );
      return result.rows;
    },
    pelicula: async (_, { id }) => {
      const result = await query(
        "SELECT id, titulo, anio, genero, director_id AS \"directorId\" FROM peliculas WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    },
  },
  Mutation: {
    agregarPelicula: async (_, { titulo, anio, genero, directorId }) => {
      const result = await query(
        "INSERT INTO peliculas (titulo, anio, genero, director_id) VALUES ($1, $2, $3, $4) RETURNING id, titulo, anio, genero, director_id AS \"directorId\"",
        [titulo, anio, genero, directorId]
      );
      return result.rows[0];
    },
  },
  Pelicula: {
    director: async (pelicula) => {
      const result = await query("SELECT id, nombre FROM directores WHERE id = $1", [pelicula.directorId]);
      return result.rows[0] || null;
    },
  },
};
