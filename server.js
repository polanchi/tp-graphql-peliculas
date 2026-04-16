import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql

  type Director {
    id: ID!
    nombre: String!
  }

  type Pelicula {
    id: ID!
    titulo: String!
    anio: Int!
    genero: String!
    director: Director!
  }

  type Query {
    peliculas: [Pelicula]
    pelicula(id: ID!): Pelicula
  }

  type Mutation {
    agregarPelicula(titulo: String!, anio: Int!, genero: String!, directorId: ID!): Pelicula
  }
`;

const directores = [
  { id: "1", nombre: "Christopher Nolan" },
  { id: "2", nombre: "Francis Ford Coppola" },
  { id: "3", nombre: "Bong Joon-ho" },
];

const peliculas = [
  { id: "1", titulo: "Inception", anio: 2010, genero: "Ciencia ficción", directorId: "1" },
  { id: "2", titulo: "El Padrino", anio: 1972, genero: "Drama", directorId: "2" },
  { id: "3", titulo: "Parasite", anio: 2019, genero: "Thriller", directorId: "3" },
];

const resolvers = {
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Servidor listo en ${url}`);