import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { DB_CONFIG } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new Pool(DB_CONFIG);

pool.on("error", (error) => {
  console.error("Postgres idle client error", error);
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

// Aplica el esquema y los datos iniciales (init.sql) al arrancar.
// El script es idempotente, así que es seguro ejecutarlo en cada inicio:
// en Render la base arranca vacía y así queda lista sin pasos manuales.
export async function inicializarBaseDeDatos() {
  const initPath = path.resolve(__dirname, "..", "init.sql");
  try {
    const sql = await fs.readFile(initPath, "utf8");
    await pool.query(sql);
    console.log("Base de datos inicializada (init.sql aplicado).");
  } catch (error) {
    console.error("No se pudo aplicar init.sql:", error.message);
    throw error;
  }
}
