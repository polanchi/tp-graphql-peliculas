const SERVIDOR = "http://localhost:4000/";

const coloresBadge = {
  "Ciencia ficción": "background:#1a2a4a;color:#60a5fa",
  "Drama": "background:#2a1a3a;color:#c084fc",
  "Thriller": "background:#2a1a3a;color:#f472b6",
  "Acción": "background:#2a1a1a;color:#f87171",
  "Comedia": "background:#1a2a1a;color:#86efac",
};

function getColor(genero) {
  return coloresBadge[genero] || "background:#2a2a2a;color:#aaa";
}

function getIniciales(nombre) {
  return nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

async function cargarPeliculas() {
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

document.getElementById("form-agregar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const anio = parseInt(document.getElementById("anio").value);
  const genero = document.getElementById("genero").value;
  const directorId = document.getElementById("directorId").value;

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

  document.getElementById("form-agregar").reset();
  cargarPeliculas();
});

cargarPeliculas();