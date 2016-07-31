import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import HapiSwagger from 'hapi-swagger';
import mongoose from 'mongoose';
import Boom from 'boom';
import glob from 'glob';
import path from 'path';
import jwt from 'jsonwebtoken';

import Pack from '../package';

import hapiAuthJwt2 from 'hapi-auth-jwt2';
import hapiBasicAuth from 'hapi-auth-basic-weeklydev-login';

import { jwtAuth as validateJwt, basicAuth as validateUserPass } from './Utils/validation.js';
import * as config from './config/config.js';

// Import routes
import userRoutes from './api/users/routes.js';
import teamRoutes from './api/teams/routes.js';
import surveyRoutes from './api/surveys/routes.js';
import submissionRoutes from './api/submissions/routes.js';
import projectRoutes from './api/projects/routes.js';

const allRoutes = [userRoutes, teamRoutes, surveyRoutes, submissionRoutes, projectRoutes];

const server = new Hapi.Server();
import startMatchmaking from './Matching';

global.PATH = process.env.PWD || process.cwd();

// Setup hapi server
server.connection({
  port: config.PORT,
  routes: {
    cors: true
  }
});

// Register the jwt auth plugin
server.register([hapiAuthJwt2,
  hapiBasicAuth,
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: {
      basePath: '/v1',
      info: {
        'title': 'Test API Documentation',
        'version': Pack.version
      }
    }
  }], {
  // Add prefix to the route
  routes: {
    prefix: '/v1'
  }
}, (err) => {

  server.auth.strategy('jwt', 'jwt', {
    key: config.JWT_SECRET, // Never Share your secret key
    validateFunc: validateJwt, // validate function defined above
    verifyOptions: {
      algorithms: ['HS256'] // pick a strong algorithm
    }
  });

  // Add Authentication based on Username Password using the authBasic standart
  server.auth.strategy('userPass', 'basic', {
    validateFunc: validateUserPass
  });
  // Make the Json Web Token strategy as default, this is basiccaly saying everything that doesn't have "auth:" in the route is JWT
  server.auth.default('jwt');
  // Add all the routes to the server
  allRoutes.forEach(routes => server.route(routes));
  // When going to the api this will redirect the "/" to the documentation
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: false
    },
    handler: function (req, res) {
      res().redirect('/v1/documentation');
    }
  });
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  } else {
    console.log('Server Started on port ' + config.PORT);
  }
  // Make a connection to the mongodb server
  mongoose.connect(config.MONGO_URL, {}, (err) => {
    if (err) {
      throw err;
    } else {
      console.log('Connected to MongoDB');
      startMatchmaking();
    }
  });
});

module.exports = server;
