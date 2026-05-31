import { getColor, getIniciales, escaparHtml, formatearFecha, estrellasTexto } from "./utils.js";
import * as api from "./api.js";

/* ============================ Estado ============================ */
let usuarioActual = null;
let generosCache = [];
let directoresCache = [];
const filtros = { busqueda: "", genero: "", directorId: "", ordenarPor: "" };

const $ = (sel) => document.querySelector(sel);
const esAdmin = () => usuarioActual?.rol?.nombre === "admin";

// Lee un archivo de imagen y lo devuelve como Data URL en base64.
function leerArchivoComoBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.readAsDataURL(archivo);
  });
}

/* ============================ Sesión ============================ */
async function cargarSesion() {
  if (!api.obtenerToken()) {
    usuarioActual = null;
    return;
  }
  try {
    usuarioActual = await api.obtenerMe();
  } catch {
    api.borrarToken();
    usuarioActual = null;
  }
}

function renderNavAuth() {
  const nav = $("#nav-auth");
  if (usuarioActual) {
    nav.innerHTML = `
      <div class="avatar avatar-sm" title="${escaparHtml(usuarioActual.nombre)}">${getIniciales(usuarioActual.nombre)}</div>
      <button class="btn-link" id="btn-perfil">Hola, ${escaparHtml(usuarioActual.nombre)}</button>
      ${esAdmin() ? '<span class="badge-admin">admin</span>' : ""}
      <button class="btn-ghost" id="btn-logout">Salir</button>
    `;
    $("#btn-perfil").addEventListener("click", mostrarPerfil);
    $("#btn-logout").addEventListener("click", cerrarSesion);
  } else {
    nav.innerHTML = `
      <button class="btn-ghost" id="btn-abrir-login">Ingresar</button>
      <button class="btn" id="btn-abrir-registro">Registrarse</button>
    `;
    $("#btn-abrir-login").addEventListener("click", () => abrirAuth("login"));
    $("#btn-abrir-registro").addEventListener("click", () => abrirAuth("registro"));
  }
}

function cerrarSesion() {
  api.borrarToken();
  usuarioActual = null;
  renderNavAuth();
  aplicarPermisosAdmin();
  mostrarCatalogo();
  renderizarPeliculas();
}

/* ============================ Modales ============================ */
function abrirModal(id) {
  $(`#${id}`).classList.remove("hidden");
}
function cerrarModal(id) {
  $(`#${id}`).classList.add("hidden");
}

function abrirAuth(tab) {
  // Cerramos el detalle para que no quede visible detrás del modal de auth
  cerrarModal("modal-detalle");
  cambiarTab(tab);
  abrirModal("modal-auth");
}

function cambiarTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  $("#form-login").classList.toggle("hidden", tab !== "login");
  $("#form-registro").classList.toggle("hidden", tab !== "registro");
}

/* ============================ Vistas ============================ */
function mostrarCatalogo() {
  $("#vista-catalogo").classList.remove("hidden");
  $("#vista-perfil").classList.add("hidden");
}

async function mostrarPerfil() {
  if (!usuarioActual) return;
  try {
    const perfil = await api.obtenerMe();
    usuarioActual = perfil;
    const cont = $("#perfil-contenido");
    const comentarios = perfil.comentarios
      .map(
        (c) => `<li>“${escaparHtml(c.texto)}” <span class="muted">en ${escaparHtml(c.pelicula?.titulo || "—")} · ${formatearFecha(c.creadoEn)}</span></li>`
      )
      .join("");
    const calificaciones = perfil.calificaciones
      .map(
        (c) => `<li><span class="estrellas-mini">${estrellasTexto(c.estrellas)}</span> ${escaparHtml(c.pelicula?.titulo || "—")}</li>`
      )
      .join("");

    cont.innerHTML = `
      <div class="perfil-header">
        <div class="avatar avatar-lg">${getIniciales(perfil.nombre)}</div>
        <div>
          <h2>${escaparHtml(perfil.nombre)} ${esAdmin() ? '<span class="badge-admin">admin</span>' : ""}</h2>
          <p class="muted">${escaparHtml(perfil.email)}</p>
          <p>${escaparHtml(perfil.bio || "Sin biografía todavía.")}</p>
        </div>
      </div>
      <div class="perfil-stats">
        <div><strong>${perfil.cantidadComentarios}</strong> comentarios</div>
        <div><strong>${perfil.cantidadCalificaciones}</strong> puntuaciones</div>
      </div>
      <div class="perfil-col">
        <div>
          <h3>Mis comentarios</h3>
          <ul class="lista-perfil">${comentarios || "<li class='muted'>Todavía no comentaste nada.</li>"}</ul>
        </div>
        <div>
          <h3>Mis puntuaciones</h3>
          <ul class="lista-perfil">${calificaciones || "<li class='muted'>Todavía no puntuaste nada.</li>"}</ul>
        </div>
      </div>
    `;
    $("#vista-catalogo").classList.add("hidden");
    $("#vista-perfil").classList.remove("hidden");
  } catch (error) {
    alert("Error al cargar el perfil: " + error.message);
  }
}

/* ============================ Catálogo ============================ */
async function cargarFiltros() {
  try {
    [generosCache, directoresCache] = await Promise.all([api.obtenerGeneros(), api.obtenerDirectores()]);
    const selGenero = $("#select-genero");
    selGenero.innerHTML =
      '<option value="">Todos los géneros</option>' +
      generosCache.map((g) => `<option value="${escaparHtml(g)}">${escaparHtml(g)}</option>`).join("");

    const selFormGenero = $("#genero");
    if (selFormGenero) {
      selFormGenero.innerHTML =
        '<option value="" disabled selected>Elegí un género</option>' +
        generosCache.map((g) => `<option value="${escaparHtml(g)}">${escaparHtml(g)}</option>`).join("");
    }

    const selDirector = $("#directorId");
    if (selDirector) {
      selDirector.innerHTML = directoresCache
        .map((d) => `<option value="${d.id}">${escaparHtml(d.nombre)}</option>`)
        .join("");
    }

    const selFiltroDirector = $("#select-director");
    if (selFiltroDirector) {
      selFiltroDirector.innerHTML =
        '<option value="">Todos los directores</option>' +
        directoresCache.map((d) => `<option value="${d.id}">${escaparHtml(d.nombre)}</option>`).join("");
      selFiltroDirector.value = filtros.directorId;
    }
    $("#total-directores").textContent = directoresCache.length;
    $("#total-generos").textContent = generosCache.length;
  } catch (error) {
    console.error("Error al cargar filtros:", error);
  }
}

async function renderizarPeliculas() {
  const grid = $("#grid-peliculas");
  try {
    const peliculas = await api.obtenerPeliculas(filtros);
    grid.innerHTML = "";

    if (peliculas.length === 0) {
      grid.innerHTML = '<p class="muted">No se encontraron películas con esos filtros.</p>';
    }

    peliculas.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card-pelicula";
      const posterHtml = p.poster
        ? `<div class="card-poster"><img src="${escaparHtml(p.poster)}" alt="${escaparHtml(p.titulo)}" loading="lazy" /></div>`
        : `<div class="card-poster" style="${getColor(p.genero)}">${getIniciales(p.titulo)}</div>`;
      card.innerHTML = `
        ${posterHtml}
        <div class="card-body">
          <h3>${escaparHtml(p.titulo)}</h3>
          <p class="muted">${p.anio} · ${escaparHtml(p.director.nombre)}</p>
          <span class="badge" style="${getColor(p.genero)}">${escaparHtml(p.genero)}</span>
          <div class="card-meta">
            <span class="estrellas-mini">${estrellasTexto(p.promedioEstrellas)}</span>
            <span class="muted">${p.promedioEstrellas} (${p.cantidadVotos})</span>
            <span class="muted">💬 ${p.cantidadComentarios}</span>
            <span class="muted">${p.meGusta ? "❤️" : "🤍"} ${p.cantidadLikes}</span>
          </div>
        </div>
      `;
      card.addEventListener("click", () => abrirDetalle(p.id));
      grid.appendChild(card);
    });

    $("#total-peliculas").textContent = peliculas.length;
    $("#pill-count").textContent = `${peliculas.length} resultados`;
  } catch (error) {
    console.error("Error al cargar películas:", error);
    grid.innerHTML = '<p class="muted">Error al cargar las películas. Verificá que el servidor esté corriendo.</p>';
  }
}

/* ============================ Detalle ============================ */
async function abrirDetalle(id) {
  try {
    const p = await api.obtenerPeliculaPorId(id);
    renderDetalle(p);
    abrirModal("modal-detalle");
  } catch (error) {
    alert("Error al cargar la película: " + error.message);
  }
}

function renderEstrellasInteractivas(pelicula) {
  if (!usuarioActual) {
    return '<p class="muted">Iniciá sesión para puntuar.</p>';
  }
  let html = '<div class="rating-widget" id="rating-widget">';
  for (let i = 1; i <= 5; i++) {
    const activa = pelicula.miCalificacion && i <= pelicula.miCalificacion;
    html += `<span class="estrella ${activa ? "activa" : ""}" data-valor="${i}">★</span>`;
  }
  html += "</div>";
  return html;
}

function renderComentario(c) {
  const puedeBorrar = usuarioActual && (String(c.usuario.id) === String(usuarioActual.id) || esAdmin());
  return `
    <li class="comentario" data-id="${c.id}">
      <div class="avatar avatar-sm">${getIniciales(c.usuario.nombre)}</div>
      <div class="comentario-cuerpo">
        <div class="comentario-head">
          <strong>${escaparHtml(c.usuario.nombre)}</strong>
          ${c.usuario.rol?.nombre === "admin" ? '<span class="badge-admin">admin</span>' : ""}
          <span class="muted">${formatearFecha(c.creadoEn)}</span>
        </div>
        <p>${escaparHtml(c.texto)}</p>
        <div class="comentario-acciones">
          <button class="btn-like" data-like-comentario="${c.id}">${c.meGusta ? "❤️" : "🤍"} ${c.cantidadLikes}</button>
          ${puedeBorrar ? `<button class="btn-link-danger" data-borrar-comentario="${c.id}">Borrar</button>` : ""}
        </div>
      </div>
    </li>
  `;
}

function renderDetalle(p) {
  const cont = $("#detalle-contenido");
  const comentariosHtml = p.comentarios.map(renderComentario).join("");

  const posterDetalleHtml = p.poster
    ? `<div class="card-poster grande"><img src="${escaparHtml(p.poster)}" alt="${escaparHtml(p.titulo)}" /></div>`
    : `<div class="card-poster grande" style="${getColor(p.genero)}">${getIniciales(p.titulo)}</div>`;

  cont.innerHTML = `
    <div class="detalle-header">
      ${posterDetalleHtml}
      <div>
        <h2>${escaparHtml(p.titulo)} <span class="muted">(${p.anio})</span></h2>
        <p class="muted">Dirigida por ${escaparHtml(p.director.nombre)}</p>
        <span class="badge" style="${getColor(p.genero)}">${escaparHtml(p.genero)}</span>
        <div class="detalle-rating">
          <span class="estrellas-grandes">${estrellasTexto(p.promedioEstrellas)}</span>
          <strong>${p.promedioEstrellas}</strong>
          <span class="muted">(${p.cantidadVotos} votos)</span>
          <button class="btn-like grande" id="btn-like-pelicula">${p.meGusta ? "❤️" : "🤍"} ${p.cantidadLikes}</button>
        </div>
      </div>
    </div>

    <div class="detalle-seccion">
      <h3>Tu puntuación</h3>
      ${renderEstrellasInteractivas(p)}
    </div>

    <div class="detalle-seccion">
      <h3>Comentarios (${p.cantidadComentarios})</h3>
      ${
        usuarioActual
          ? `<form id="form-comentario" class="form-comentario">
               <textarea id="texto-comentario" placeholder="Escribí tu comentario..." required></textarea>
               <button type="submit" class="btn">Comentar</button>
             </form>`
          : '<p class="muted">Iniciá sesión para dejar un comentario.</p>'
      }
      <ul class="lista-comentarios" id="lista-comentarios">${comentariosHtml || '<li class="muted">Todavía no hay comentarios. ¡Sé el primero!</li>'}</ul>
    </div>
  `;

  conectarEventosDetalle(p);
}

function conectarEventosDetalle(p) {
  // Like a la película
  const btnLike = $("#btn-like-pelicula");
  if (btnLike) {
    btnLike.addEventListener("click", async () => {
      if (!usuarioActual) return abrirAuth("login");
      try {
        const r = await api.toggleLikePelicula(p.id);
        btnLike.textContent = `${r.meGusta ? "❤️" : "🤍"} ${r.cantidadLikes}`;
        renderizarPeliculas();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Puntuar con estrellas
  const widget = $("#rating-widget");
  if (widget) {
    widget.querySelectorAll(".estrella").forEach((est) => {
      est.addEventListener("click", async () => {
        const estrellas = Number(est.dataset.valor);
        try {
          await api.calificarPelicula({ peliculaId: p.id, estrellas });
          await abrirDetalle(p.id);
          renderizarPeliculas();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  }

  // Nuevo comentario
  const form = $("#form-comentario");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const texto = $("#texto-comentario").value.trim();
      if (!texto) return;
      try {
        await api.agregarComentario({ peliculaId: p.id, texto });
        await abrirDetalle(p.id);
        renderizarPeliculas();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Likes y borrado de comentarios (delegación)
  const lista = $("#lista-comentarios");
  if (lista) {
    lista.addEventListener("click", async (e) => {
      const likeBtn = e.target.closest("[data-like-comentario]");
      const borrarBtn = e.target.closest("[data-borrar-comentario]");
      if (likeBtn) {
        if (!usuarioActual) return abrirAuth("login");
        try {
          const r = await api.toggleLikeComentario(likeBtn.dataset.likeComentario);
          likeBtn.textContent = `${r.meGusta ? "❤️" : "🤍"} ${r.cantidadLikes}`;
        } catch (error) {
          alert(error.message);
        }
      } else if (borrarBtn) {
        if (!confirm("¿Borrar este comentario?")) return;
        try {
          await api.eliminarComentario(borrarBtn.dataset.borrarComentario);
          await abrirDetalle(p.id);
          renderizarPeliculas();
        } catch (error) {
          alert(error.message);
        }
      }
    });
  }
}

/* ============================ Formularios auth ============================ */
async function manejarLogin(e) {
  e.preventDefault();
  const msg = $("#login-msg");
  msg.textContent = "";
  try {
    const { token } = await api.login({
      email: $("#login-email").value.trim(),
      password: $("#login-password").value,
    });
    api.guardarToken(token);
    await cargarSesion();
    renderNavAuth();
    aplicarPermisosAdmin();
    cerrarModal("modal-auth");
    $("#form-login").reset();
    renderizarPeliculas();
  } catch (error) {
    msg.textContent = error.message;
  }
}

async function manejarRegistro(e) {
  e.preventDefault();
  const msg = $("#registro-msg");
  msg.textContent = "";
  try {
    const { token } = await api.registrar({
      nombre: $("#reg-nombre").value.trim(),
      email: $("#reg-email").value.trim(),
      password: $("#reg-password").value,
    });
    api.guardarToken(token);
    await cargarSesion();
    renderNavAuth();
    aplicarPermisosAdmin();
    cerrarModal("modal-auth");
    $("#form-registro").reset();
    renderizarPeliculas();
  } catch (error) {
    msg.textContent = error.message;
  }
}

/* ============================ Admin ============================ */
function aplicarPermisosAdmin() {
  // Los botones de administración solo están disponibles para administradores.
  $("#btn-abrir-agregar").classList.toggle("hidden", !esAdmin());
  $("#btn-abrir-agregar-director").classList.toggle("hidden", !esAdmin());
  if (!esAdmin()) {
    cerrarModal("modal-agregar");
    cerrarModal("modal-agregar-director");
  }
}

async function manejarAgregarPelicula(e) {
  e.preventDefault();
  const msg = $("#agregar-msg");
  msg.textContent = "";
  const titulo = $("#titulo").value.trim();
  const anio = parseInt($("#anio").value, 10);
  const genero = $("#genero").value.trim();
  const directorId = $("#directorId").value;
  const archivoPoster = $("#poster").files[0];
  if (!titulo || !anio || !genero || !directorId) {
    msg.textContent = "Completá todos los campos.";
    return;
  }
  try {
    const poster = archivoPoster ? await leerArchivoComoBase64(archivoPoster) : null;
    await api.crearPelicula({ titulo, anio, genero, directorId, poster });
    $("#form-agregar").reset();
    $("#poster-preview").classList.add("hidden");
    cerrarModal("modal-agregar");
    await cargarFiltros();
    await renderizarPeliculas();
  } catch (error) {
    msg.textContent = "Error al agregar la película: " + error.message;
  }
}

async function manejarAgregarDirector(e) {
  e.preventDefault();
  const msg = $("#agregar-director-msg");
  msg.textContent = "";
  const nombre = $("#director-nombre").value.trim();
  if (!nombre) {
    msg.textContent = "Ingresá el nombre del director.";
    return;
  }
  try {
    await api.crearDirector({ nombre });
    $("#form-agregar-director").reset();
    cerrarModal("modal-agregar-director");
    await cargarFiltros();
  } catch (error) {
    msg.textContent = "Error al agregar el director: " + error.message;
  }
}

/* ============================ Init ============================ */
function conectarEventosGlobales() {
  // Cerrar modales (botón × y click en overlay)
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => cerrarModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  // Tabs de auth
  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => cambiarTab(t.dataset.tab));
  });

  $("#form-login").addEventListener("submit", manejarLogin);
  $("#form-registro").addEventListener("submit", manejarRegistro);
  $("#form-agregar").addEventListener("submit", manejarAgregarPelicula);
  $("#form-agregar-director").addEventListener("submit", manejarAgregarDirector);
  // Vista previa del poster al elegir una imagen
  $("#poster").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    const preview = $("#poster-preview");
    if (!archivo) {
      preview.classList.add("hidden");
      return;
    }
    try {
      preview.src = await leerArchivoComoBase64(archivo);
      preview.classList.remove("hidden");
    } catch {
      preview.classList.add("hidden");
    }
  });

  $("#btn-abrir-agregar").addEventListener("click", () => abrirModal("modal-agregar"));
  $("#btn-abrir-agregar-director").addEventListener("click", () => abrirModal("modal-agregar-director"));
  $("#btn-volver-catalogo").addEventListener("click", mostrarCatalogo);
  $("#logo-home").addEventListener("click", () => {
    mostrarCatalogo();
    renderizarPeliculas();
  });

  // Filtros
  let debounce;
  $("#input-busqueda").addEventListener("input", (e) => {
    clearTimeout(debounce);
    filtros.busqueda = e.target.value;
    debounce = setTimeout(renderizarPeliculas, 300);
  });
  $("#select-genero").addEventListener("change", (e) => {
    filtros.genero = e.target.value;
    renderizarPeliculas();
  });
  $("#select-director").addEventListener("change", (e) => {
    filtros.directorId = e.target.value;
    renderizarPeliculas();
  });
  $("#select-orden").addEventListener("change", (e) => {
    filtros.ordenarPor = e.target.value;
    renderizarPeliculas();
  });
}

async function inicializar() {
  conectarEventosGlobales();
  await cargarSesion();
  renderNavAuth();
  aplicarPermisosAdmin();
  await cargarFiltros();
  await renderizarPeliculas();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
