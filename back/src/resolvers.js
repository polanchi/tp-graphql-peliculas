import { directoresResolvers } from "./entities/directores.js";
import { rolesResolvers } from "./entities/roles.js";
import { usuariosResolvers } from "./entities/usuarios.js";
import { peliculasResolvers } from "./entities/peliculas.js";
import { comentariosResolvers } from "./entities/comentarios.js";
import { calificacionesResolvers } from "./entities/calificaciones.js";

export const resolvers = [
  directoresResolvers,
  rolesResolvers,
  usuariosResolvers,
  peliculasResolvers,
  comentariosResolvers,
  calificacionesResolvers,
];
