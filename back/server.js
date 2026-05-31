import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./src/schema.js";
import { resolvers } from "./src/resolvers.js";
import { LISTEN_OPTIONS } from "./src/config.js";
import { buildContext } from "./src/auth.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  ...LISTEN_OPTIONS,
  context: buildContext,
});

console.log(`Servidor listo en ${url}`);
