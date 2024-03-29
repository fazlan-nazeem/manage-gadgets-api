const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { createStore } = require("./utils");
const DeviceAPI = require("./datasources/device");
const DeviceRepairAPI = require("./datasources/deviceRepair");
const DeviceCategoryAPI = require("./datasources/deviceCategory");
const DeviceAssignmentAPI = require("./datasources/deviceAssignment");
var config = require("./config");

const express = require("express");
const app = express();
// const jwt = require("express-jwt");
// const jwtAuthz = require("express-jwt-authz");
// const jwksRsa = require("jwks-rsa");

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
// const checkJwt = jwt({
//   // Dynamically provide a signing key
//   // based on the kid in the header and
//   // the signing keys provided by the JWKS endpoint.
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: config.auth.jwks,
//   }),

//   // Validate the audience and the issuer.
//   audience: config.auth.audience,
//   issuer: config.auth.issuer,
//   algorithms: ["RS256"],
// });

// app.use(checkJwt);

// const datastore = createStore();
// const server = new ApolloServer({
//   cors: {
//     credentials: true,
//     origin: (origin, callback) => {
//       callback(null, true);
//     },
//   },
//   typeDefs,
//   resolvers,
//   context: (req) => {
//     const user = req.user;
//     console.log(user);
//     return { user };
//   },
//   dataSources: () => ({
//     deviceAPI: new DeviceAPI({ datastore }),
//     deviceRepairAPI: new DeviceRepairAPI({ datastore }),
//     deviceCategoryAPI: new DeviceCategoryAPI({ datastore }),
//     deviceAssignmentAPI: new DeviceAssignmentAPI({ datastore }),
//   }),
// });


// // server.applyMiddleware({ app });
// server.applyMiddleware({ app, path: '/graphql' });

// app.listen({ port: config.host.server_port }, () => {
//   console.log(`🚀 Server ready at ${config.host.server_url}:${config.host.server_port}${server.graphqlPath}`);
// });

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const datastore = createStore();
  const server = new ApolloServer({
    typeDefs, resolvers, dataSources: () => ({
      deviceAPI: new DeviceAPI({ datastore }),
      deviceRepairAPI: new DeviceRepairAPI({ datastore }),
      deviceCategoryAPI: new DeviceCategoryAPI({ datastore }),
      deviceAssignmentAPI: new DeviceAssignmentAPI({ datastore }),
    }),
  });

  // You must await server.start() before calling server.applyMiddleware()
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startApolloServer(typeDefs, resolvers);