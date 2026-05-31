// Función para obtener color del badge según el género
export function getColor(genero) {
  const coloresBadge = {
    "Ciencia ficción": "background:#1a2a4a;color:#60a5fa",
    "Drama": "background:#2a1a3a;color:#c084fc",
    "Thriller": "background:#2a1a3a;color:#f472b6",
    "Acción": "background:#2a1a1a;color:#f87171",
    "Comedia": "background:#1a2a1a;color:#86efac",
  };
  return coloresBadge[genero] || "background:#2a2a2a;color:#aaa";
}

// Función para obtener iniciales de un nombre
export function getIniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Escapa texto para insertarlo de forma segura en HTML
export function escaparHtml(texto) {
  if (texto == null) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Devuelve una fecha legible a partir de un timestamp/ISO o epoch en string
export function formatearFecha(valor) {
  if (!valor) return "";
  let fecha;
  if (/^\d+$/.test(String(valor))) {
    fecha = new Date(Number(valor));
  } else {
    fecha = new Date(valor);
  }
  if (isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Genera el HTML de estrellas (llenas/vacías) para mostrar un promedio
export function estrellasTexto(promedio) {
  const llenas = Math.round(promedio);
  let salida = "";
  for (let i = 1; i <= 5; i++) {
    salida += i <= llenas ? "★" : "☆";
  }
  return salida;
}
