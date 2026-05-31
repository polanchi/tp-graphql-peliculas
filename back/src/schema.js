import { directoresTypeDefs } from "./entities/directores.js";
import { rolesTypeDefs } from "./entities/roles.js";
import { usuariosTypeDefs } from "./entities/usuarios.js";
import { peliculasTypeDefs } from "./entities/peliculas.js";
import { comentariosTypeDefs } from "./entities/comentarios.js";
import { calificacionesTypeDefs } from "./entities/calificaciones.js";

const rootTypeDefs = `#graphql
  type Query
  type Mutation
`;

export const typeDefs = [
  rootTypeDefs,
  directoresTypeDefs,
  rolesTypeDefs,
  usuariosTypeDefs,
  peliculasTypeDefs,
  comentariosTypeDefs,
  calificacionesTypeDefs,
];
