import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import { connectToMongo } from './config/mongoConnection.js';
import { authenticateUser, extractTokenFromHeader } from './middlewares/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { parse as urlParse } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import { parse as parseContentType } from 'content-type';
import finalhandler from 'finalhandler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.SEED === 'true') {
  await import('./data/seed.js');
}

const port = Number(process.env.PORT) || 4000;

await connectToMongo();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false,
});

await server.start();

const certsPath = path.resolve(__dirname, '..', 'public', 'certs');

const context = async ({ req }) => {
  const token = extractTokenFromHeader(req);
  const user = await authenticateUser(token);
  return { user };
};

const corsHandler = cors();
const jsonHandler = bodyParser.json({
  verify(req) {
    const charset = parseContentType(req).parameters.charset || 'utf-8';
    if (!charset.match(/^utf-(8|((16|32)(le|be)?))$/i)) {
      throw Object.assign(new Error(`unsupported charset "${charset.toUpperCase()}"`), {
        status: 415,
        name: 'UnsupportedMediaTypeError',
        charset,
        type: 'charset.unsupported',
      });
    }
  },
  limit: '50mb',
});

const httpServer = http.createServer((req, res) => {
  if (req.url.startsWith('/certs/')) {
    const filename = req.url.slice(7);
    const filePath = path.join(certsPath, filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const fileBuffer = fs.readFileSync(filePath);
      res.end(fileBuffer);
      return;
    }
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const errorHandler = finalhandler(req, res, {
    onerror(err) {
      console.error(err.stack || err.toString());
    },
  });

  corsHandler(req, res, (err) => {
    if (err) {
      errorHandler(err);
      return;
    }
    jsonHandler(req, res, (err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      const headers = new Map();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }
      const httpGraphQLRequest = {
        method: req.method.toUpperCase(),
        headers,
        search: urlParse(req.url).search ?? '',
        body: 'body' in req ? req.body : undefined,
      };
      server
        .executeHTTPGraphQLRequest({
          httpGraphQLRequest,
          context: () => context({ req, res }),
        })
        .then(async (httpGraphQLResponse) => {
          for (const [key, value] of httpGraphQLResponse.headers) {
            res.setHeader(key, value);
          }
          res.statusCode = httpGraphQLResponse.status || 200;
          if (httpGraphQLResponse.body.kind === 'complete') {
            res.end(httpGraphQLResponse.body.string);
            return;
          }
          for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
            res.write(chunk);
          }
          res.end();
        })
        .catch((err) => {
          errorHandler(err);
        });
    });
  });
});

await new Promise((resolve) => {
  httpServer.listen({ port }, resolve);
});

console.log(`🚀 Server ready at http://localhost:${port}/graphql`);