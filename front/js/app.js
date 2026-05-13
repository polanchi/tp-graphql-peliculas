import { getColor, getIniciales } from "./utils.js";
import { obtenerPeliculas, crearPelicula } from "./api.js";

/**
 * Renderiza la tabla de películas
 */
async function renderizarPeliculas() {
  try {
    const peliculas = await obtenerPeliculas();
    const tbody = document.getElementById("lista-peliculas");
    tbody.innerHTML = "";

    peliculas.forEach((p, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${index + 1}</td>
        <td style="color:#fff;font-weight:500">${p.titulo}</td>
        <td style="color:#888">${p.anio}</td>
        <td><span class="badge" style="${getColor(p.genero)}">${p.genero}</span></td>
        <td>
          <div class="director-pill">
            <div class="avatar">${getIniciales(p.director.nombre)}</div>
            <span>${p.director.nombre}</span>
          </div>
        </td>
      `;
      tbody.appendChild(fila);
    });

    // Actualizar estadísticas
    document.getElementById("total-peliculas").textContent = peliculas.length;
    document.getElementById("pill-count").textContent = `${peliculas.length} resultados`;

    const generos = new Set(peliculas.map((p) => p.genero));
    document.getElementById("total-generos").textContent = generos.size;
  } catch (error) {
    console.error("Error al cargar películas:", error);
    alert("Error al cargar las películas. Verifica que el servidor esté corriendo.");
  }
}

/**
 * Maneja el envío del formulario
 */
async function manejarSubmitFormulario(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const anio = parseInt(document.getElementById("anio").value);
  const genero = document.getElementById("genero").value.trim();
  const directorId = document.getElementById("directorId").value;

  // Validar datos
  if (!titulo || !anio || !genero) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    await crearPelicula({ titulo, anio, genero, directorId });
    document.getElementById("form-agregar").reset();
    await renderizarPeliculas();
    alert("¡Película agregada exitosamente!");
  } catch (error) {
    console.error("Error al agregar película:", error);
    alert("Error al agregar la película");
  }
}

/**
 * Inicializa la aplicación
 */
function inicializar() {
  // Cargar películas al iniciar
  renderizarPeliculas();

  // Configurar listener del formulario
  const form = document.getElementById("form-agregar");
  if (form) {
    form.addEventListener("submit", manejarSubmitFormulario);
  }
}

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
