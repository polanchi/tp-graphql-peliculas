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
  return nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
