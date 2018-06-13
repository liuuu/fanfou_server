"use strict";

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _apolloServerExpress = require("apollo-server-express");

var _graphqlTools = require("graphql-tools");

var _cors = _interopRequireDefault(require("cors"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _path = _interopRequireDefault(require("path"));

var _mergeGraphqlSchemas = require("merge-graphql-schemas");

var _http = require("http");

var _subscriptionsTransportWs = require("subscriptions-transport-ws");

var _graphql = require("graphql");

var _user = _interopRequireDefault(require("./models/user"));

var _message = _interopRequireDefault(require("./models/message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import typeDefs from './schema/user';
// import resolvers from './resolvers/user';
// graphql version not right
// https://github.com/okgrow/merge-graphql-schemas/issues/111
const typeDefs = (0, _mergeGraphqlSchemas.mergeTypes)((0, _mergeGraphqlSchemas.fileLoader)(_path.default.join(__dirname, './schema')));
const resolvers = (0, _mergeGraphqlSchemas.mergeResolvers)((0, _mergeGraphqlSchemas.fileLoader)(_path.default.join(__dirname, './resolvers')));
const secrets = {
  JWT_SECRET: '123456'
};

const getUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  console.log('token', token);
  console.log(typeof token);
  console.log(token !== 'null');

  if (token) {
    try {
      console.log('why');
      const user = await _jsonwebtoken.default.verify(token, secrets.JWT_SECRET);
      console.log('user--------', user);
      req.user = user;
    } catch (err) {
      console.log('err from getUser', err);
    }
  }

  next();
}; // Put together a schema


const schema = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs,
  resolvers
});
const localDataUri = 'mongodb://test:test@ds046267.mlab.com:46267/testfanfou'; // const localDataUri = 'mongodb://localhost/testninja22';

_mongoose.default.connect(localDataUri);

const db = _mongoose.default.connection.once('open', async () => {
  // console.log('db', db);
  console.log('Connected to database successfully');
  const app = (0, _express.default)();
  app.use((0, _cors.default)('*'));
  app.use(getUser); // The GraphQL endpoint

  app.use('/graphql', _bodyParser.default.json(), (0, _apolloServerExpress.graphqlExpress)(req => ({
    schema,
    context: {
      User: _user.default,
      Message: _message.default,
      user: req.user
    }
  }))); // GraphiQL, a visual editor for queries
  // app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  app.use('/graphiql', (0, _apolloServerExpress.graphiqlExpress)({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:5555/subscriptions'
  }));
  const ws = (0, _http.createServer)(app);
  ws.listen(5555, () => {
    console.log('Apollo Server is now running on http://localhost:5555'); // Set up the WebSocket for handling GraphQL subscriptions
    // omg
    // eslint-disable-next-line

    new _subscriptionsTransportWs.SubscriptionServer({
      execute: _graphql.execute,
      subscribe: _graphql.subscribe,
      schema,
      onConnect: (connectionParams, webSocket) => {
        const {
          xtoken
        } = connectionParams; // console.log('xtoken', xtoken);
        // I think cause the frontend protect
      },
      onOperationDone: webSocket => {
        console.log('on operation done');
      },
      onDisconnect: webSocket => {
        console.log('on operation done');
      }
    }, {
      server: ws,
      path: '/subscriptions'
    });
  }); // Start the server
  // app.listen(5555, () => {
  //   console.log('Go to http://localhost:5555/graphiql to run queries!');
  // });
}).on('error', err => {
  console.log('Connected to database error', err);
});