import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./src/schema.js";
import { resolvers } from "./src/resolvers.js";
import { PORT, LISTEN_OPTIONS } from "./src/config.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, LISTEN_OPTIONS);

console.log(`Servidor listo en ${url}`);
