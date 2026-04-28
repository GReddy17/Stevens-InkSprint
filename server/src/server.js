import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';;
import connectDB from './config/connect.js';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import { authenticateUser, extractTokenFromHeader } from './middlewares/auth.js';

const app = express();
const PORT = process.env.PORT || 4000;

await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers
})

await server.start();

app.use(express.json());

app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
        const token = extractTokenFromHeader(req);
        const user = await authenticateUser(token);
        return { user };
    }
}));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});