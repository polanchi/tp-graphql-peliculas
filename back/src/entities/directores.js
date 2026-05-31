import { query } from "../db.js";
import { requireAdmin } from "../auth.js";

export const directoresTypeDefs = `#graphql
  type Director {
    id: ID!
    nombre: String!
  }

  extend type Query {
    directores: [Director]
    director(id: ID!): Director
  }

  extend type Mutation {
    agregarDirector(nombre: String!): Director
  }
`;

export const directoresResolvers = {
  Query: {
    directores: async () => {
      const result = await query("SELECT id, nombre FROM directores ORDER BY id");
      return result.rows;
    },
    director: async (_, { id }) => {
      const result = await query("SELECT id, nombre FROM directores WHERE id = $1", [id]);
      return result.rows[0] || null;
    },
  },
  Mutation: {
    agregarDirector: async (_, { nombre }, context) => {
      requireAdmin(context);
      const result = await query(
        "INSERT INTO directores (nombre) VALUES ($1) RETURNING id, nombre",
        [nombre]
      );
      return result.rows[0];
    },
  },
};
