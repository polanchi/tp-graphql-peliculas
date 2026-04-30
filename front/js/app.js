import { getColor, getIniciales } from "./utils.js";

const SERVIDOR = "http://localhost:4000/";

// Cargar películas desde GraphQL
export async function cargarPeliculas() {
  const respuesta = await fetch(SERVIDOR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          peliculas {
            id
            titulo
            anio
            genero
            director { nombre }
          }
        }
      `,
    }),
  });

  const { data } = await respuesta.json();
  const tbody = document.getElementById("lista-peliculas");
  tbody.innerHTML = "";

  data.peliculas.forEach((p) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
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

  document.getElementById("total-peliculas").textContent = data.peliculas.length;
  const generos = new Set(data.peliculas.map((p) => p.genero));
  document.getElementById("total-generos").textContent = generos.size;
}

// Agregar nueva película
export async function agregarPelicula(titulo, anio, genero, directorId) {
  await fetch(SERVIDOR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation {
          agregarPelicula(
            titulo: "${titulo}"
            anio: ${anio}
            genero: "${genero}"
            directorId: "${directorId}"
          ) {
            id
            titulo
          }
        }
      `,
    }),
  });

  cargarPeliculas();
}
