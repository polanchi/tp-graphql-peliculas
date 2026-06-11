export function getColor(genero) {
  const coloresBadge = {
    "Ciencia ficcion": "background:rgba(81,112,157,.24);color:#bcd2ff;border:1px solid rgba(159,183,223,.18)",
    "Ciencia ficción": "background:rgba(81,112,157,.24);color:#bcd2ff;border:1px solid rgba(159,183,223,.18)",
    Drama: "background:rgba(126,74,51,.28);color:#f2d3a4;border:1px solid rgba(235,195,145,.18)",
    Thriller: "background:rgba(125,49,43,.28);color:#ffcab8;border:1px solid rgba(238,157,144,.18)",
    Accion: "background:rgba(130,58,38,.28);color:#ffc6ae;border:1px solid rgba(235,154,123,.18)",
    "Acción": "background:rgba(130,58,38,.28);color:#ffc6ae;border:1px solid rgba(235,154,123,.18)",
    Comedia: "background:rgba(110,99,54,.28);color:#f5e39e;border:1px solid rgba(245,225,136,.18)",
    Romance: "background:rgba(129,76,92,.28);color:#ffd0dd;border:1px solid rgba(255,180,201,.18)",
    Suspenso: "background:rgba(71,67,84,.3);color:#d9d2eb;border:1px solid rgba(189,183,217,.18)",
    Terror: "background:rgba(74,38,48,.32);color:#f6c8d5;border:1px solid rgba(209,127,157,.18)",
    Documental: "background:rgba(78,88,66,.3);color:#dbe8be;border:1px solid rgba(180,196,142,.18)",
  };

  return (
    coloresBadge[genero] ||
    "background:rgba(255,244,223,.05);color:#e8d7b5;border:1px solid rgba(216,176,111,.16)"
  );
}

export function getIniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function escaparHtml(texto) {
  if (texto == null) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

export function estrellasTexto(promedio) {
  const llenas = Math.round(promedio);
  let salida = "";
  for (let i = 1; i <= 5; i++) {
    salida += i <= llenas ? "★" : "☆";
  }
  return salida;
}
