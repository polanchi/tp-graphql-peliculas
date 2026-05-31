import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./src/schema.js";
import { resolvers } from "./src/resolvers.js";
import { PORT, IMAGES_ROUTE, IMAGES_DIR } from "./src/config.js";
import { buildContext } from "./src/auth.js";
import { asegurarCarpetasImagenes } from "./src/uploads.js";

await asegurarCarpetasImagenes();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
await server.start();

const app = express();

// Las imágenes (posters) se sirven como archivos estáticos desde el mismo servidor.
app.use(IMAGES_ROUTE, cors(), express.static(IMAGES_DIR));

// Endpoint de GraphQL en la raíz (mismo puerto que las imágenes).
app.use(
  "/",
  cors(),
  // Aumentamos el límite del body para aceptar imágenes en base64.
  express.json({ limit: "10mb" }),
  expressMiddleware(server, { context: buildContext })
);

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}/`);
  console.log(`Imágenes disponibles en http://localhost:${PORT}${IMAGES_ROUTE}/`);
});
