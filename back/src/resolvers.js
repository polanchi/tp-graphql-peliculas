import { directores, peliculas } from "./data.js";

// Resolvers GraphQL
export const resolvers = {
  Query: {
    peliculas: () => peliculas,
    pelicula: (_, { id }) => peliculas.find((p) => p.id === id),
  },

  Mutation: {
    agregarPelicula: (_, { titulo, anio, genero, directorId }) => {
      const nuevaPelicula = {
        id: String(peliculas.length + 1),
        titulo,
        anio,
        genero,
        directorId,
      };
      peliculas.push(nuevaPelicula);
      return nuevaPelicula;
    },
  },

  Pelicula: {
    director: (pelicula) => directores.find((d) => d.id === pelicula.directorId),
  },
};
