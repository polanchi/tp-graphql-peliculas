/**
 * API GraphQL - Funciones para comunicarse con el servidor
 */

const GRAPHQL_URL = "http://localhost:4000/";

/**
 * Realiza una consulta GraphQL al servidor
 * @param {string} query - La consulta GraphQL
 * @returns {Promise<Object>} Los datos de la respuesta
 */
async function ejecutarConsulta(query) {
  try {
    const respuesta = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();

    if (resultado.errors) {
      console.error("Error GraphQL:", resultado.errors);
      throw new Error(resultado.errors[0].message);
    }

    return resultado.data;
  } catch (error) {
    console.error("Error en consulta GraphQL:", error);
    throw error;
  }
}

/**
 * Obtiene todas las películas con su información de director
 * @returns {Promise<Array>} Lista de películas
 */
export async function obtenerPeliculas() {
  const query = `
    query {
      peliculas {
        id
        titulo
        anio
        genero
        director {
          id
          nombre
        }
      }
    }
  `;

  const data = await ejecutarConsulta(query);
  return data.peliculas;
}

/**
 * Obtiene una película específica por ID
 * @param {string} id - ID de la película
 * @returns {Promise<Object>} Datos de la película
 */
export async function obtenerPeliculaPorId(id) {
  const query = `
    query {
      pelicula(id: "${id}") {
        id
        titulo
        anio
        genero
        director {
          id
          nombre
        }
      }
    }
  `;

  const data = await ejecutarConsulta(query);
  return data.pelicula;
}

/**
 * Agrega una nueva película
 * @param {Object} params - Parámetros de la película
 * @param {string} params.titulo - Título de la película
 * @param {number} params.anio - Año de la película
 * @param {string} params.genero - Género de la película
 * @param {string} params.directorId - ID del director
 * @returns {Promise<Object>} Datos de la película creada
 */
export async function crearPelicula({ titulo, anio, genero, directorId }) {
  // Sanitizar entrada para evitar inyecciones
  const tituloPuro = titulo.replace(/"/g, '\\"');
  const generoPuro = genero.replace(/"/g, '\\"');

  const query = `
    mutation {
      agregarPelicula(
        titulo: "${tituloPuro}"
        anio: ${anio}
        genero: "${generoPuro}"
        directorId: "${directorId}"
      ) {
        id
        titulo
        anio
        genero
        director {
          id
          nombre
        }
      }
    }
  `;

  const data = await ejecutarConsulta(query);
  return data.agregarPelicula;
}
