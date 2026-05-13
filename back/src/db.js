import { Pool } from "pg";
import { DB_CONFIG } from "./config.js";

export const pool = new Pool(DB_CONFIG);

pool.on("error", (error) => {
  console.error("Postgres idle client error", error);
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
