import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./src/schema.js";
import { resolvers } from "./src/resolvers.js";
import { PORT, IMAGES_ROUTE, IMAGES_DIR } from "./src/config.js";
import { buildContext } from "./src/auth.js";
import { asegurarCarpetasImagenes } from "./src/uploads.js";
import { inicializarBaseDeDatos } from "./src/db.js";

// Servidor principal de CineSocial.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// back -> raíz del repo -> front
const FRONTEND_DIR = path.resolve(__dirname, "..", "front");

await asegurarCarpetasImagenes();
await inicializarBaseDeDatos();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
await server.start();

const app = express();

// Las imágenes (posters) se sirven como archivos estáticos desde el mismo servidor.
app.use(IMAGES_ROUTE, cors(), express.static(IMAGES_DIR));

// Endpoint de GraphQL (mismo puerto que el frontend y las imágenes).
app.use(
  "/graphql",
  cors(),
  // Aumentamos el límite del body para aceptar imágenes en base64.
  express.json({ limit: "10mb" }),
  expressMiddleware(server, { context: buildContext })
);

// Frontend estático (HTML, CSS y JS) servido desde el mismo servidor.
app.use(express.static(FRONTEND_DIR));

// Cualquier otra ruta devuelve el index del frontend.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
  console.log(`GraphQL disponible en /graphql`);
  console.log(`Imágenes disponibles en ${IMAGES_ROUTE}/`);
});
