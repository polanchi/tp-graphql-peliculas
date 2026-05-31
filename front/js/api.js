/**
 * API GraphQL - Funciones para comunicarse con el servidor
 */

// URL relativa: el frontend y el backend se sirven desde el mismo origen
// (una sola imagen Docker), por lo que funciona en cualquier dominio (Render, localhost, etc.).
const GRAPHQL_URL = "/graphql";
const TOKEN_KEY = "peliculas_token";

export function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Ejecuta una operación GraphQL (query o mutation) con variables.
 * @param {string} query - La operación GraphQL
 * @param {Object} variables - Variables de la operación
 * @returns {Promise<Object>} Los datos de la respuesta
 */
async function ejecutarConsulta(query, variables = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = obtenerToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  const resultado = await respuesta.json();

  if (resultado.errors) {
    throw new Error(resultado.errors[0].message);
  }

  return resultado.data;
}

/* ----------------------- Autenticación ----------------------- */

export async function registrar({ nombre, email, password }) {
  const query = `
    mutation Registrar($nombre: String!, $email: String!, $password: String!) {
      registrar(nombre: $nombre, email: $email, password: $password) {
        token
        usuario { id nombre email rol { nombre } }
      }
    }
  `;
  const data = await ejecutarConsulta(query, { nombre, email, password });
  return data.registrar;
}

export async function login({ email, password }) {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        usuario { id nombre email rol { nombre } }
      }
    }
  `;
  const data = await ejecutarConsulta(query, { email, password });
  return data.login;
}

export async function obtenerMe() {
  const query = `
    query {
      me {
        id
        nombre
        email
        bio
        rol { nombre }
        cantidadComentarios
        cantidadCalificaciones
        comentarios {
          id
          texto
          creadoEn
          pelicula { id titulo }
        }
        calificaciones {
          id
          estrellas
          pelicula { id titulo }
        }
      }
    }
  `;
  const data = await ejecutarConsulta(query);
  return data.me;
}

export async function actualizarPerfil({ nombre, bio }) {
  const query = `
    mutation ActualizarPerfil($nombre: String, $bio: String) {
      actualizarPerfil(nombre: $nombre, bio: $bio) {
        id nombre bio
      }
    }
  `;
  const data = await ejecutarConsulta(query, { nombre, bio });
  return data.actualizarPerfil;
}

/* ----------------------- Películas ----------------------- */

const CAMPOS_PELICULA = `
  id
  titulo
  anio
  genero
  poster
  director { id nombre }
  promedioEstrellas
  cantidadVotos
  miCalificacion
  cantidadLikes
  meGusta
  cantidadComentarios
`;

export async function obtenerPeliculas({ busqueda, genero, directorId, ordenarPor } = {}) {
  const query = `
    query Peliculas($busqueda: String, $genero: String, $directorId: ID, $ordenarPor: OrdenPelicula) {
      peliculas(busqueda: $busqueda, genero: $genero, directorId: $directorId, ordenarPor: $ordenarPor) {
        ${CAMPOS_PELICULA}
      }
    }
  `;
  const data = await ejecutarConsulta(query, {
    busqueda: busqueda || null,
    genero: genero || null,
    directorId: directorId || null,
    ordenarPor: ordenarPor || null,
  });
  return data.peliculas;
}

export async function obtenerPeliculaPorId(id) {
  const query = `
    query Pelicula($id: ID!) {
      pelicula(id: $id) {
        ${CAMPOS_PELICULA}
        comentarios {
          id
          texto
          creadoEn
          cantidadLikes
          meGusta
          usuario { id nombre rol { nombre } }
        }
      }
    }
  `;
  const data = await ejecutarConsulta(query, { id });
  return data.pelicula;
}

export async function obtenerGeneros() {
  const data = await ejecutarConsulta(`query { generos }`);
  return data.generos;
}

export async function obtenerDirectores() {
  const data = await ejecutarConsulta(`query { directores { id nombre } }`);
  return data.directores;
}

export async function crearDirector({ nombre }) {
  const query = `
    mutation AgregarDirector($nombre: String!) {
      agregarDirector(nombre: $nombre) {
        id nombre
      }
    }
  `;
  const data = await ejecutarConsulta(query, { nombre });
  return data.agregarDirector;
}

export async function crearPelicula({ titulo, anio, genero, directorId, poster }) {
  const query = `
    mutation Agregar($titulo: String!, $anio: Int!, $genero: String!, $directorId: ID!, $poster: String) {
      agregarPelicula(titulo: $titulo, anio: $anio, genero: $genero, directorId: $directorId, poster: $poster) {
        id titulo poster
      }
    }
  `;
  const data = await ejecutarConsulta(query, { titulo, anio, genero, directorId, poster: poster || null });
  return data.agregarPelicula;
}

export async function editarPelicula({ id, titulo, anio, genero, directorId, poster }) {
  const query = `
    mutation Editar($id: ID!, $titulo: String, $anio: Int, $genero: String, $directorId: ID, $poster: String) {
      editarPelicula(id: $id, titulo: $titulo, anio: $anio, genero: $genero, directorId: $directorId, poster: $poster) {
        id titulo anio genero poster director { id nombre }
      }
    }
  `;
  const data = await ejecutarConsulta(query, {
    id,
    titulo,
    anio,
    genero,
    directorId,
    poster: poster || null,
  });
  return data.editarPelicula;
}

export async function eliminarPelicula(id) {
  const query = `mutation Eliminar($id: ID!) { eliminarPelicula(id: $id) }`;
  const data = await ejecutarConsulta(query, { id });
  return data.eliminarPelicula;
}

export async function calificarPelicula({ peliculaId, estrellas }) {
  const query = `
    mutation Calificar($peliculaId: ID!, $estrellas: Int!) {
      calificarPelicula(peliculaId: $peliculaId, estrellas: $estrellas) {
        id promedioEstrellas cantidadVotos miCalificacion
      }
    }
  `;
  const data = await ejecutarConsulta(query, { peliculaId, estrellas });
  return data.calificarPelicula;
}

export async function toggleLikePelicula(peliculaId) {
  const query = `
    mutation Like($peliculaId: ID!) {
      toggleLikePelicula(peliculaId: $peliculaId) {
        id cantidadLikes meGusta
      }
    }
  `;
  const data = await ejecutarConsulta(query, { peliculaId });
  return data.toggleLikePelicula;
}

/* ----------------------- Comentarios ----------------------- */

export async function agregarComentario({ peliculaId, texto }) {
  const query = `
    mutation Comentar($peliculaId: ID!, $texto: String!) {
      agregarComentario(peliculaId: $peliculaId, texto: $texto) {
        id
        texto
        creadoEn
        cantidadLikes
        meGusta
        usuario { id nombre rol { nombre } }
      }
    }
  `;
  const data = await ejecutarConsulta(query, { peliculaId, texto });
  return data.agregarComentario;
}

export async function eliminarComentario(id) {
  const query = `mutation EliminarComentario($id: ID!) { eliminarComentario(id: $id) }`;
  const data = await ejecutarConsulta(query, { id });
  return data.eliminarComentario;
}

export async function toggleLikeComentario(comentarioId) {
  const query = `
    mutation LikeComentario($comentarioId: ID!) {
      toggleLikeComentario(comentarioId: $comentarioId) {
        id cantidadLikes meGusta
      }
    }
  `;
  const data = await ejecutarConsulta(query, { comentarioId });
  return data.toggleLikeComentario;
}
