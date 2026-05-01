import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import { connectToMongo } from './config/mongoConnection.js';
import { authenticateUser, extractTokenFromHeader } from './middlewares/auth.js';

const port = Number(process.env.PORT) || 4000;

await connectToMongo();

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => {
    const token = extractTokenFromHeader(req);
    const user = await authenticateUser(token);
    return { user };
  },
});

console.log(`🚀 Server ready at ${url}`);