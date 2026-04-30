import { query } from "../db.js";

export const rolesTypeDefs = `#graphql
  type Rol {
    id: ID!
    nombre: String!
  }

  extend type Query {
    roles: [Rol]
  }
`;

export const rolesResolvers = {
  Query: {
    roles: async () => {
      const result = await query("SELECT id, nombre FROM roles ORDER BY id");
      return result.rows;
    },
  },
};
