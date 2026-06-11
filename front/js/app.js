import { getColor, getIniciales, escaparHtml, formatearFecha, estrellasTexto } from "./utils.js";
import * as api from "./api.js";

/* ============================ Estado ============================ */
let usuarioActual = null;
let generosCache = [];
let directoresCache = [];
let peliculaPendienteEliminar = null;
let comentarioPendienteEliminar = null;
const filtros = { busqueda: "", genero: "", directorId: "", ordenarPor: "" };
const TEMA_KEY = "cinesocial-tema";
let temaActual = localStorage.getItem(TEMA_KEY) === "light" ? "light" : "dark";

const $ = (sel) => document.querySelector(sel);
const esAdmin = () => usuarioActual?.rol?.nombre === "admin";

function leerArchivoComoBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.readAsDataURL(archivo);
  });
}

function renderAvatar(usuario, clase = "avatar-sm") {
  const nombre = escaparHtml(usuario?.nombre || "Usuario");
  if (usuario?.avatar) {
    return `<div class="avatar ${clase} avatar-foto" title="${nombre}">
      <img src="${escaparHtml(usuario.avatar)}" alt="${nombre}" />
    </div>`;
  }
  return `<div class="avatar ${clase}" title="${nombre}">${getIniciales(usuario?.nombre)}</div>`;
}

/* ============================ Tema ============================ */
function textoBotonTema() {
  return temaActual === "light" ? "Tema negro" : "Tema blanco";
}

function aplicarTema() {
  document.body.dataset.theme = temaActual;
  document.querySelectorAll("[data-toggle-tema]").forEach((btn) => {
    btn.textContent = textoBotonTema();
    btn.setAttribute("aria-label", `Cambiar a ${textoBotonTema().toLowerCase()}`);
  });
}

function alternarTema() {
  temaActual = temaActual === "light" ? "dark" : "light";
  localStorage.setItem(TEMA_KEY, temaActual);
  aplicarTema();
}

function renderBotonTema() {
  return `<button class="btn-ghost btn-theme" data-toggle-tema type="button">${textoBotonTema()}</button>`;
}

/* ============================ Sesion ============================ */
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
      ${renderAvatar(usuarioActual)}
      <button class="btn-link" id="btn-perfil">Hola, ${escaparHtml(usuarioActual.nombre)}</button>
      ${esAdmin() ? '<span class="badge-admin">admin</span>' : ""}
      ${renderBotonTema()}
      <button class="btn-ghost" id="btn-logout">Salir</button>
    `;
    $("#btn-perfil").addEventListener("click", mostrarPerfil);
    $("#btn-logout").addEventListener("click", cerrarSesion);
  } else {
    nav.innerHTML = `
      ${renderBotonTema()}
      <button class="btn-ghost" id="btn-abrir-login">Ingresar</button>
      <button class="btn" id="btn-abrir-registro">Registrarse</button>
    `;
    $("#btn-abrir-login").addEventListener("click", () => abrirAuth("login"));
    $("#btn-abrir-registro").addEventListener("click", () => abrirAuth("registro"));
  }
  document.querySelectorAll("[data-toggle-tema]").forEach((btn) => {
    btn.addEventListener("click", alternarTema);
  });
  aplicarTema();
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
  cerrarModal("modal-detalle");
  cambiarTab(tab);
  abrirModal("modal-auth");
}

function cambiarTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  $("#form-login").classList.toggle("hidden", tab !== "login");
  $("#form-registro").classList.toggle("hidden", tab !== "registro");
}

function abrirConfirmacionEliminar(pelicula) {
  peliculaPendienteEliminar = pelicula;
  $("#confirm-eliminar-titulo").textContent = `"${pelicula.titulo}"`;
  $("#confirm-eliminar-msg").textContent = "";
  abrirModal("modal-confirmar-eliminar");
}

function cerrarConfirmacionEliminar() {
  peliculaPendienteEliminar = null;
  $("#confirm-eliminar-msg").textContent = "";
  cerrarModal("modal-confirmar-eliminar");
}

function abrirConfirmacionEliminarComentario({ comentarioId, peliculaId }) {
  comentarioPendienteEliminar = { comentarioId, peliculaId };
  $("#confirm-comentario-msg").textContent = "";
  abrirModal("modal-confirmar-comentario");
}

function cerrarConfirmacionEliminarComentario() {
  comentarioPendienteEliminar = null;
  $("#confirm-comentario-msg").textContent = "";
  cerrarModal("modal-confirmar-comentario");
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
        (c) => `
          <li class="perfil-activity-item">
            <strong>${escaparHtml(c.pelicula?.titulo || "Sin pelicula")}</strong>
            <p>"${escaparHtml(c.texto)}"</p>
            <span class="perfil-activity-date">${formatearFecha(c.creadoEn)}</span>
          </li>
        `
      )
      .join("");

    const calificaciones = perfil.calificaciones
      .map(
        (c) => `
          <li class="perfil-activity-item">
            <strong>${escaparHtml(c.pelicula?.titulo || "Sin pelicula")}</strong>
            <span class="estrellas-mini">${estrellasTexto(c.estrellas)}</span>
          </li>
        `
      )
      .join("");

    cont.innerHTML = `
      <div class="perfil-layout">
        <aside class="perfil-side">
          <div class="perfil-header">
            ${renderAvatar(perfil, "avatar-lg")}
            <div class="perfil-info">
              <span class="perfil-meta">Miembro de CineSocial</span>
              <h2>${escaparHtml(perfil.nombre)} ${esAdmin() ? '<span class="badge-admin">admin</span>' : ""}</h2>
              <p class="muted">${escaparHtml(perfil.email)}</p>
            </div>
          </div>

          <div class="perfil-bio-box">
            <span class="perfil-meta">Sobre mi</span>
            <p class="perfil-bio">${escaparHtml(perfil.bio || "Sin biografia todavia. Completa tu perfil para contar que tipo de cine te gusta.")}</p>
          </div>

          <div class="perfil-stats">
            <div class="perfil-stat-box">
              <span class="perfil-meta">Comentarios</span>
              <strong>${perfil.cantidadComentarios}</strong>
            </div>
            <div class="perfil-stat-box">
              <span class="perfil-meta">Puntuaciones</span>
              <strong>${perfil.cantidadCalificaciones}</strong>
            </div>
          </div>

          <div class="perfil-ticket">
            <div class="detalle-fact">
              <span>Perfil</span>
              <strong>${esAdmin() ? "Administrador" : "Usuario"}</strong>
            </div>
            <div class="detalle-fact">
              <span>Actividad</span>
              <strong>Critica y comunidad</strong>
            </div>
          </div>

          <button class="btn btn-sm btn-block" id="btn-editar-perfil">Editar perfil</button>
        </aside>

        <section class="perfil-main">
          <div class="perfil-main-header">
            <div>
              <span class="section-kicker">Sala personal</span>
              <h3>Tu actividad cinefila</h3>
              <p class="muted">Administra tu nombre, biografia y revisa tus comentarios y puntuaciones dentro del catalogo.</p>
            </div>
            <button class="btn-ghost btn-sm perfil-edit-shortcut" id="btn-editar-perfil-main">Editar datos</button>
          </div>

          <form id="form-editar-perfil" class="form-editar-perfil hidden">
            <div class="perfil-form-heading">
              <div>
                <span class="perfil-meta">Editar credencial</span>
                <h3>Datos del perfil</h3>
              </div>
              <span class="perfil-form-note">Se muestra en tus comentarios</span>
            </div>
            <div class="field">
              <label for="editar-nombre">Nombre</label>
              <input id="editar-nombre" type="text" maxlength="100" value="${escaparHtml(perfil.nombre)}" required />
            </div>
            <div class="field">
              <label for="editar-bio">Biografia</label>
              <textarea id="editar-bio" rows="3" maxlength="500" placeholder="Contanos algo sobre vos...">${escaparHtml(perfil.bio || "")}</textarea>
            </div>
            <div class="field">
              <label for="editar-avatar">Foto de perfil</label>
              <input id="editar-avatar" type="file" accept="image/*" />
              <p class="field-help">Subi una imagen JPG, PNG, WEBP, GIF o AVIF. Si no elegis una nueva, se conserva la actual.</p>
              <img id="editar-avatar-preview" class="avatar-preview ${perfil.avatar ? "" : "hidden"}" src="${escaparHtml(perfil.avatar || "")}" alt="Vista previa de foto de perfil" />
            </div>
            <div class="form-editar-acciones">
              <button type="submit" class="btn btn-sm">Guardar cambios</button>
              <button type="button" class="btn-ghost btn-sm" id="btn-cancelar-editar">Cancelar</button>
            </div>
            <p class="auth-msg" id="editar-perfil-msg"></p>
          </form>

          <div class="perfil-col">
            <div class="perfil-list-card">
              <div class="perfil-list-head">
                <h3>Mis comentarios</h3>
                <span class="perfil-list-count">${perfil.cantidadComentarios}</span>
              </div>
              <ul class="lista-perfil">${comentarios || "<li class='muted'>Todavia no comentaste nada.</li>"}</ul>
            </div>
            <div class="perfil-list-card">
              <div class="perfil-list-head">
                <h3>Mis puntuaciones</h3>
                <span class="perfil-list-count">${perfil.cantidadCalificaciones}</span>
              </div>
              <ul class="lista-perfil">${calificaciones || "<li class='muted'>Todavia no puntuaste nada.</li>"}</ul>
            </div>
          </div>
        </section>
      </div>
    `;

    const mostrarEditorPerfil = () => {
      $("#form-editar-perfil").classList.remove("hidden");
      $("#btn-editar-perfil").classList.add("hidden");
      $("#btn-editar-perfil-main").classList.add("hidden");
      $("#editar-nombre").focus();
    };

    $("#btn-editar-perfil").addEventListener("click", mostrarEditorPerfil);
    $("#btn-editar-perfil-main").addEventListener("click", mostrarEditorPerfil);
    $("#btn-cancelar-editar").addEventListener("click", () => {
      $("#form-editar-perfil").classList.add("hidden");
      $("#btn-editar-perfil").classList.remove("hidden");
      $("#btn-editar-perfil-main").classList.remove("hidden");
      $("#editar-perfil-msg").textContent = "";
    });
    $("#editar-avatar").addEventListener("change", async (e) => {
      const archivo = e.target.files[0];
      const preview = $("#editar-avatar-preview");
      if (archivo) {
        preview.src = await leerArchivoComoBase64(archivo);
        preview.classList.remove("hidden");
      } else {
        preview.src = perfil.avatar || "";
        preview.classList.toggle("hidden", !perfil.avatar);
      }
    });
    $("#form-editar-perfil").addEventListener("submit", manejarEditarPerfil);

    $("#vista-catalogo").classList.add("hidden");
    $("#vista-perfil").classList.remove("hidden");
  } catch (error) {
    alert("Error al cargar el perfil: " + error.message);
  }
}

async function mostrarPerfilAnterior() {
  if (!usuarioActual) return;
  try {
    const perfil = await api.obtenerMe();
    usuarioActual = perfil;
    const cont = $("#perfil-contenido");

    const comentarios = perfil.comentarios
      .map(
        (c) =>
          `<li><strong>${escaparHtml(c.pelicula?.titulo || "Sin pelicula")}</strong><br /><span class="muted">"${escaparHtml(c.texto)}" · ${formatearFecha(c.creadoEn)}</span></li>`
      )
      .join("");

    const calificaciones = perfil.calificaciones
      .map(
        (c) =>
          `<li><strong>${escaparHtml(c.pelicula?.titulo || "Sin pelicula")}</strong><br /><span class="estrellas-mini">${estrellasTexto(c.estrellas)}</span></li>`
      )
      .join("");

    cont.innerHTML = `
      <div class="perfil-layout">
        <aside class="perfil-side">
          <div class="perfil-header">
            <div class="avatar avatar-lg">${getIniciales(perfil.nombre)}</div>
            <div class="perfil-info">
              <span class="perfil-meta">Miembro de CineSocial</span>
              <h2>${escaparHtml(perfil.nombre)} ${esAdmin() ? '<span class="badge-admin">admin</span>' : ""}</h2>
              <p class="muted">${escaparHtml(perfil.email)}</p>
            </div>
          </div>

          <p class="perfil-bio">${escaparHtml(perfil.bio || "Sin biografia todavia. Completa tu perfil para contar que tipo de cine te gusta.")}</p>

          <div class="perfil-stats">
            <div class="perfil-stat-box">
              <span class="perfil-meta">Comentarios</span>
              <strong>${perfil.cantidadComentarios}</strong>
            </div>
            <div class="perfil-stat-box">
              <span class="perfil-meta">Puntuaciones</span>
              <strong>${perfil.cantidadCalificaciones}</strong>
            </div>
          </div>

          <div class="detalle-fact">
            <span>Perfil</span>
            <strong>${esAdmin() ? "Administrador" : "Usuario"}</strong>
          </div>
          <div class="detalle-fact">
            <span>Actividad</span>
            <strong>Critica y comunidad</strong>
          </div>

          <button class="btn-ghost btn-sm" id="btn-editar-perfil">Editar perfil</button>
        </aside>

        <section class="perfil-main">
          <h3>Tu sala personal</h3>
          <p class="muted">Tu perfil reune comentarios, puntuaciones y actividad dentro del catalogo.</p>

          <form id="form-editar-perfil" class="form-editar-perfil hidden">
            <div class="field">
              <label for="editar-nombre">Nombre</label>
              <input id="editar-nombre" type="text" maxlength="100" value="${escaparHtml(perfil.nombre)}" required />
            </div>
            <div class="field">
              <label for="editar-bio">Biografia</label>
              <textarea id="editar-bio" rows="3" maxlength="500" placeholder="Contanos algo sobre vos...">${escaparHtml(perfil.bio || "")}</textarea>
            </div>
            <div class="form-editar-acciones">
              <button type="submit" class="btn btn-sm">Guardar cambios</button>
              <button type="button" class="btn-ghost btn-sm" id="btn-cancelar-editar">Cancelar</button>
            </div>
            <p class="auth-msg" id="editar-perfil-msg"></p>
          </form>

          <div class="perfil-col">
            <div class="perfil-list-card">
              <h3>Mis comentarios</h3>
              <ul class="lista-perfil">${comentarios || "<li class='muted'>Todavia no comentaste nada.</li>"}</ul>
            </div>
            <div class="perfil-list-card">
              <h3>Mis puntuaciones</h3>
              <ul class="lista-perfil">${calificaciones || "<li class='muted'>Todavia no puntuaste nada.</li>"}</ul>
            </div>
          </div>
        </section>
      </div>
    `;

    $("#btn-editar-perfil").addEventListener("click", () => {
      $("#form-editar-perfil").classList.remove("hidden");
      $("#btn-editar-perfil").classList.add("hidden");
    });
    $("#btn-cancelar-editar").addEventListener("click", () => {
      $("#form-editar-perfil").classList.add("hidden");
      $("#btn-editar-perfil").classList.remove("hidden");
      $("#editar-perfil-msg").textContent = "";
    });
    $("#form-editar-perfil").addEventListener("submit", manejarEditarPerfil);

    $("#vista-catalogo").classList.add("hidden");
    $("#vista-perfil").classList.remove("hidden");
  } catch (error) {
    alert("Error al cargar el perfil: " + error.message);
  }
}

async function manejarEditarPerfil(e) {
  e.preventDefault();
  const msg = $("#editar-perfil-msg");
  msg.textContent = "";
  const nombre = $("#editar-nombre").value.trim();
  const bio = $("#editar-bio").value.trim();
  const archivoAvatar = $("#editar-avatar")?.files[0];
  if (!nombre) {
    msg.textContent = "El nombre no puede estar vacio.";
    return;
  }
  try {
    const avatar = archivoAvatar ? await leerArchivoComoBase64(archivoAvatar) : null;
    await api.actualizarPerfil({ nombre, bio, avatar });
    await mostrarPerfil();
    renderNavAuth();
  } catch (error) {
    msg.textContent = error.message;
  }
}

/* ============================ Catalogo ============================ */
async function cargarFiltros() {
  try {
    [generosCache, directoresCache] = await Promise.all([api.obtenerGeneros(), api.obtenerDirectores()]);

    $("#select-genero").innerHTML =
      '<option value="">Todos los generos</option>' +
      generosCache.map((g) => `<option value="${escaparHtml(g)}">${escaparHtml(g)}</option>`).join("");

    const optsGenero = generosCache
      .map((g) => `<option value="${escaparHtml(g)}">${escaparHtml(g)}</option>`)
      .join("");
    const optsDirector = directoresCache
      .map((d) => `<option value="${d.id}">${escaparHtml(d.nombre)}</option>`)
      .join("");

    if ($("#genero")) {
      $("#genero").innerHTML = '<option value="" disabled selected>Elegi un genero</option>' + optsGenero;
    }
    if ($("#directorId")) {
      $("#directorId").innerHTML = optsDirector;
    }
    if ($("#editar-genero")) {
      $("#editar-genero").innerHTML = optsGenero;
    }
    if ($("#editar-directorId")) {
      $("#editar-directorId").innerHTML = optsDirector;
    }
    if ($("#select-director")) {
      $("#select-director").innerHTML =
        '<option value="">Todos los directores</option>' +
        directoresCache.map((d) => `<option value="${d.id}">${escaparHtml(d.nombre)}</option>`).join("");
      $("#select-director").value = filtros.directorId;
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
      grid.innerHTML = '<p class="muted">No se encontraron peliculas con esos filtros.</p>';
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
          <div class="card-kicker">
            <span class="card-year">${p.anio}</span>
            <span class="badge" style="${getColor(p.genero)}">${escaparHtml(p.genero)}</span>
          </div>
          <h3>${escaparHtml(p.titulo)}</h3>
          <p>${escaparHtml(p.director.nombre)}</p>
          <div class="card-meta">
            <span class="meta-pill"><span class="estrellas-mini">${estrellasTexto(p.promedioEstrellas)}</span> ${p.promedioEstrellas}</span>
            <span class="meta-pill">${p.cantidadVotos} votos</span>
          </div>
          <div class="card-stats">
            <span class="meta-pill">${p.cantidadComentarios} comentarios</span>
            <span class="meta-pill">${p.cantidadLikes} likes</span>
          </div>
        </div>
      `;
      card.addEventListener("click", () => abrirDetalle(p.id));
      grid.appendChild(card);
    });

    $("#total-peliculas").textContent = peliculas.length;
    $("#pill-count").textContent = `${peliculas.length} resultados`;
  } catch (error) {
    console.error("Error al cargar peliculas:", error);
    grid.innerHTML = '<p class="muted">Error al cargar las peliculas. Verifica que el servidor este corriendo.</p>';
  }
}

/* ============================ Detalle ============================ */
async function abrirDetalle(id) {
  try {
    const p = await api.obtenerPeliculaPorId(id);
    renderDetalle(p);
    abrirModal("modal-detalle");
  } catch (error) {
    alert("Error al cargar la pelicula: " + error.message);
  }
}

function renderEstrellasInteractivas(pelicula) {
  if (!usuarioActual) {
    return '<p class="muted">Inicia sesion para puntuar.</p>';
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
      ${renderAvatar(c.usuario)}
      <div class="comentario-cuerpo">
        <div class="comentario-head">
          <strong>${escaparHtml(c.usuario.nombre)}</strong>
          ${c.usuario.rol?.nombre === "admin" ? '<span class="badge-admin">admin</span>' : ""}
          <span class="comentario-time">${formatearFecha(c.creadoEn)}</span>
        </div>
        <p>${escaparHtml(c.texto)}</p>
        <div class="comentario-acciones">
          <button class="btn-like" data-like-comentario="${c.id}">${c.meGusta ? "Te gusta" : "Me gusta"} · ${c.cantidadLikes}</button>
          ${puedeBorrar ? `<button class="btn-link-danger" data-borrar-comentario="${c.id}">Borrar</button>` : ""}
        </div>
      </div>
    </li>
  `;
}

function renderDetalle(p) {
  const cont = $("#detalle-contenido");
  const comentariosHtml = p.comentarios.map(renderComentario).join("");
  const detalleBackdrop = p.poster
    ? `style="background-image:url('${escaparHtml(p.poster)}')"`
    : `style="${getColor(p.genero)}"`;

  const posterDetalleHtml = p.poster
    ? `<div class="card-poster grande"><img src="${escaparHtml(p.poster)}" alt="${escaparHtml(p.titulo)}" /></div>`
    : `<div class="card-poster grande" style="${getColor(p.genero)}">${getIniciales(p.titulo)}</div>`;

  cont.innerHTML = `
    <section class="detalle-hero">
      <div class="detalle-backdrop" ${detalleBackdrop}></div>
      <div class="detalle-header">
        ${posterDetalleHtml}
        <div class="detalle-copy">
          <span class="hero-kicker">Ficha tecnica</span>
          <h2>${escaparHtml(p.titulo)}</h2>
          <p class="detalle-subline">${p.anio} · Dirigida por ${escaparHtml(p.director.nombre)}</p>
          <div class="detalle-meta-line">
            <span class="badge" style="${getColor(p.genero)}">${escaparHtml(p.genero)}</span>
            <span class="meta-pill">${p.cantidadComentarios} comentarios</span>
            <span class="meta-pill">${p.cantidadLikes} likes</span>
          </div>
          <div class="detalle-rating">
            <div class="rating-badge">
              <span class="estrellas-grandes">${estrellasTexto(p.promedioEstrellas)}</span>
              <strong>${p.promedioEstrellas}</strong>
              <span>${p.cantidadVotos} votos</span>
            </div>
            <button class="btn-like grande" id="btn-like-pelicula">${p.meGusta ? "Te gusta" : "Me gusta"} · ${p.cantidadLikes}</button>
          </div>
          ${
            esAdmin()
              ? `<div class="detalle-admin-acciones">
                   <button class="btn-ghost btn-sm" id="btn-editar-pelicula">Editar pelicula</button>
                   <button class="btn-link-danger" id="btn-eliminar-pelicula">Eliminar pelicula</button>
                 </div>`
              : ""
          }
        </div>
      </div>
    </section>

    <div class="detalle-grid">
      <aside class="detalle-panel">
        <div>
          <span class="perfil-meta">Valoracion</span>
          <h3>Puntuacion del publico</h3>
          <p class="muted">Mira el promedio de votos, los comentarios y deja tu propia calificacion.</p>
        </div>
        <div class="detalle-fact">
          <span>Genero</span>
          <strong>${escaparHtml(p.genero)}</strong>
        </div>
        <div class="detalle-fact">
          <span>Director</span>
          <strong>${escaparHtml(p.director.nombre)}</strong>
        </div>
        <div class="detalle-fact">
          <span>Likes</span>
          <strong>${p.cantidadLikes}</strong>
        </div>
        <div class="detalle-fact">
          <span>Tu puntuacion</span>
          ${renderEstrellasInteractivas(p)}
        </div>
      </aside>

      <div>
        <div class="detalle-seccion">
          <h3>Comentarios (${p.cantidadComentarios})</h3>
          ${
            usuarioActual
              ? `<form id="form-comentario" class="form-comentario">
                   <textarea id="texto-comentario" placeholder="Escribe tu comentario..." required></textarea>
                   <button type="submit" class="btn">Publicar comentario</button>
                 </form>`
              : '<p class="muted">Inicia sesion para dejar un comentario.</p>'
          }
          <ul class="lista-comentarios" id="lista-comentarios">${comentariosHtml || '<li class="muted">Todavia no hay comentarios. Se el primero.</li>'}</ul>
        </div>
      </div>
    </div>
  `;

  conectarEventosDetalle(p);
}

function conectarEventosDetalle(p) {
  const btnLike = $("#btn-like-pelicula");
  if (btnLike) {
    btnLike.addEventListener("click", async () => {
      if (!usuarioActual) return abrirAuth("login");
      try {
        const r = await api.toggleLikePelicula(p.id);
        btnLike.textContent = `${r.meGusta ? "Te gusta" : "Me gusta"} · ${r.cantidadLikes}`;
        renderizarPeliculas();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const btnEditar = $("#btn-editar-pelicula");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => abrirEditarPelicula(p));
  }
  const btnEliminar = $("#btn-eliminar-pelicula");
  if (btnEliminar) {
    btnEliminar.addEventListener("click", () => abrirConfirmacionEliminar(p));
  }

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

  const lista = $("#lista-comentarios");
  if (lista) {
    lista.addEventListener("click", async (e) => {
      const likeBtn = e.target.closest("[data-like-comentario]");
      const borrarBtn = e.target.closest("[data-borrar-comentario]");
      if (likeBtn) {
        if (!usuarioActual) return abrirAuth("login");
        try {
          const r = await api.toggleLikeComentario(likeBtn.dataset.likeComentario);
          likeBtn.textContent = `${r.meGusta ? "Te gusta" : "Me gusta"} · ${r.cantidadLikes}`;
        } catch (error) {
          alert(error.message);
        }
      } else if (borrarBtn) {
        abrirConfirmacionEliminarComentario({
          comentarioId: borrarBtn.dataset.borrarComentario,
          peliculaId: p.id,
        });
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
  $("#btn-abrir-agregar").classList.toggle("hidden", !esAdmin());
  $("#btn-abrir-agregar-director").classList.toggle("hidden", !esAdmin());
  if (!esAdmin()) {
    cerrarModal("modal-agregar");
    cerrarModal("modal-agregar-director");
    cerrarModal("modal-editar");
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
    msg.textContent = "Completa todos los campos.";
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
    msg.textContent = "Error al agregar la pelicula: " + error.message;
  }
}

function abrirEditarPelicula(p) {
  $("#editar-id").value = p.id;
  $("#editar-titulo").value = p.titulo;
  $("#editar-anio").value = p.anio;
  $("#editar-genero").value = p.genero;
  $("#editar-directorId").value = p.director.id;
  $("#editar-poster").value = "";
  $("#editar-pelicula-msg").textContent = "";
  const preview = $("#editar-poster-preview");
  if (p.poster) {
    preview.src = p.poster;
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }
  cerrarModal("modal-detalle");
  abrirModal("modal-editar");
}

async function manejarEditarPelicula(e) {
  e.preventDefault();
  const msg = $("#editar-pelicula-msg");
  msg.textContent = "";
  const id = $("#editar-id").value;
  const titulo = $("#editar-titulo").value.trim();
  const anio = parseInt($("#editar-anio").value, 10);
  const genero = $("#editar-genero").value.trim();
  const directorId = $("#editar-directorId").value;
  const archivoPoster = $("#editar-poster").files[0];
  if (!titulo || !anio || !genero || !directorId) {
    msg.textContent = "Completa todos los campos.";
    return;
  }
  try {
    const poster = archivoPoster ? await leerArchivoComoBase64(archivoPoster) : null;
    await api.editarPelicula({ id, titulo, anio, genero, directorId, poster });
    cerrarModal("modal-editar");
    await renderizarPeliculas();
    await abrirDetalle(id);
  } catch (error) {
    msg.textContent = "Error al editar la pelicula: " + error.message;
  }
}

async function manejarAgregarDirector(e) {
  e.preventDefault();
  const msg = $("#agregar-director-msg");
  msg.textContent = "";
  const nombre = $("#director-nombre").value.trim();
  if (!nombre) {
    msg.textContent = "Ingresa el nombre del director.";
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

async function manejarConfirmarEliminarPelicula() {
  if (!peliculaPendienteEliminar) return;

  const msg = $("#confirm-eliminar-msg");
  const btn = $("#btn-confirmar-eliminar");
  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Eliminando...";

  try {
    await api.eliminarPelicula(peliculaPendienteEliminar.id);
    cerrarConfirmacionEliminar();
    cerrarModal("modal-detalle");
    await renderizarPeliculas();
  } catch (error) {
    msg.textContent = "Error al eliminar la pelicula: " + error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Eliminar";
  }
}

async function manejarConfirmarEliminarComentario() {
  if (!comentarioPendienteEliminar) return;

  const msg = $("#confirm-comentario-msg");
  const btn = $("#btn-confirmar-comentario");
  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Borrando...";

  try {
    await api.eliminarComentario(comentarioPendienteEliminar.comentarioId);
    const peliculaId = comentarioPendienteEliminar.peliculaId;
    cerrarConfirmacionEliminarComentario();
    await abrirDetalle(peliculaId);
    renderizarPeliculas();
  } catch (error) {
    msg.textContent = "Error al borrar el comentario: " + error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Borrar comentario";
  }
}

/* ============================ Init ============================ */
function conectarEventosGlobales() {
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => cerrarModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => cambiarTab(t.dataset.tab));
  });

  $("#form-login").addEventListener("submit", manejarLogin);
  $("#form-registro").addEventListener("submit", manejarRegistro);
  $("#form-agregar").addEventListener("submit", manejarAgregarPelicula);
  $("#form-editar").addEventListener("submit", manejarEditarPelicula);
  $("#form-agregar-director").addEventListener("submit", manejarAgregarDirector);
  $("#btn-cancelar-eliminar").addEventListener("click", cerrarConfirmacionEliminar);
  $("#btn-confirmar-eliminar").addEventListener("click", manejarConfirmarEliminarPelicula);
  $("#btn-cancelar-comentario").addEventListener("click", cerrarConfirmacionEliminarComentario);
  $("#btn-confirmar-comentario").addEventListener("click", manejarConfirmarEliminarComentario);

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

  $("#editar-poster").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    const preview = $("#editar-poster-preview");
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
  aplicarTema();
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
