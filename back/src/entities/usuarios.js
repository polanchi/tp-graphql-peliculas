import { query } from "../db.js";

export const usuariosTypeDefs = `#graphql
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    rol: Rol!
  }

  extend type Query {
    usuarios: [Usuario]
    usuario(id: ID!): Usuario
  }

  extend type Mutation {
    agregarUsuario(nombre: String!, email: String!, rolId: ID!): Usuario
  }
`;

export const usuariosResolvers = {
  Query: {
    usuarios: async () => {
      const result = await query("SELECT id, nombre, email, rol_id AS \"rolId\" FROM usuarios ORDER BY id");
      return result.rows;
    },
    usuario: async (_, { id }) => {
      const result = await query(
        "SELECT id, nombre, email, rol_id AS \"rolId\" FROM usuarios WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    },
  },
  Mutation: {
    agregarUsuario: async (_, { nombre, email, rolId }) => {
      const result = await query(
        "INSERT INTO usuarios (nombre, email, rol_id) VALUES ($1, $2, $3) RETURNING id, nombre, email, rol_id AS \"rolId\"",
        [nombre, email, rolId]
      );
      return result.rows[0];
    },
  },
  Usuario: {
    rol: async (usuario) => {
      const result = await query("SELECT id, nombre FROM roles WHERE id = $1", [usuario.rolId]);
      return result.rows[0] || null;
    },
  },
};
