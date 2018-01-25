import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import { mergeResolvers, mergeTypes, fileLoader } from 'merge-graphql-schemas';
// import typeDefs from './schema/user';
// import resolvers from './resolvers/user';
import User from './models/user';
import Message from './models/message';

// graphql version not right
// https://github.com/okgrow/merge-graphql-schemas/issues/111

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const secrets = {
  JWT_SECRET: '123456',
};

const getUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  console.log('token', token);

  if (token) {
    try {
      const user = await jwt.verify(token, secrets.JWT_SECRET);
      console.log('user--------', user);

      req.user = user;
    } catch (err) {
      console.log('err from getUser', err);
    }
  }
  next();
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// const dataUri = 'mongodb://test:test@ds046267.mlab.com:46267/testfanfou';
const localDataUri = 'mongodb://localhost/testninja22';

mongoose.connect(localDataUri);

const db = mongoose.connection
  .once('open', async () => {
    console.log('db', db);

    console.log('Connected to database successfully');

    const app = express();

    app.use(cors('*'));
    app.use(getUser);

    // The GraphQL endpoint
    app.use(
      '/graphql',
      bodyParser.json(),
      graphqlExpress(req => ({
        schema,
        context: {
          User,
          Message,
          user: req.user,
        },
      })),
    );

    // GraphiQL, a visual editor for queries
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

    // Start the server
    app.listen(5555, () => {
      console.log('Go to http://localhost:5555/graphiql to run queries!');
    });
  })
  .on('error', (err) => {
    console.log('Connected to database error', err);
  });
