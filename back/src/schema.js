// Schema GraphQL
export const typeDefs = `#graphql

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
