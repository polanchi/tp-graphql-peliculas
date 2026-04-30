import { cargarPeliculas, agregarPelicula } from "./api.js";

// Listener del formulario para agregar película
document.getElementById("form-agregar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const anio = parseInt(document.getElementById("anio").value);
  const genero = document.getElementById("genero").value;
  const directorId = document.getElementById("directorId").value;

  await agregarPelicula(titulo, anio, genero, directorId);

  document.getElementById("form-agregar").reset();
});

// Cargar películas al iniciar
cargarPeliculas();
