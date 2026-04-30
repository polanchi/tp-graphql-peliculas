import { directoresResolvers } from "./entities/directores.js";
import { rolesResolvers } from "./entities/roles.js";
import { usuariosResolvers } from "./entities/usuarios.js";
import { peliculasResolvers } from "./entities/peliculas.js";

export const resolvers = [
  directoresResolvers,
  rolesResolvers,
  usuariosResolvers,
  peliculasResolvers,
];
