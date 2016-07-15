import Hapi from 'hapi'
import mongoose from 'mongoose'
import Boom from 'boom'
import glob from 'glob'
import path from 'path'
import jwt from 'jsonwebtoken'

import { jwtAuth as validateJwt, basicAuth as validateUserPass } from './Utils/validation.js'
import * as config from './config/config.js'

// Import routes
import userRoutes from './api/users/routes.js'
import teamRoutes from './api/teams/routes.js'
import surveyRoutes from './api/surveys/routes.js'
import submissionRoutes from './api/submissions/routes.js'
import projectRoutes from './api/projects/routes.js'

const allRoutes = [userRoutes, teamRoutes, surveyRoutes, submissionRoutes, projectRoutes]

const server = new Hapi.Server();

global.PATH = process.env.PWD;

// Setup hapi server
server.connection({
  port: config.PORT,
  routes: {
    cors: true
  }
});

// Register the jwt auth plugin
server.register([require('hapi-auth-jwt2'), require('hapi-auth-basic-weeklydev-login')], (err) => {

  server.auth.strategy('jwt', 'jwt', {
    key: config.JWT_SECRET, // Never Share your secret key
    validateFunc: validateJwt, // validate function defined above
    verifyOptions: {
      algorithms: ['HS256'] // pick a strong algorithm
    }
  });

  server.auth.strategy('userPass', 'basic', {
    validateFunc: validateUserPass
  });

  server.auth.default('jwt');
  // Add all the routes to the server
  allRoutes.forEach(routes => server.route(routes))

  // Add index route to show server is running
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: false
    },
    handler: function(req, res){
      res({
        success: true,
        message: 'Server is running!'
      })
    }
  })
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  } else {
    console.log('Server Started');
  }
  // Make a connection to the mongodb server
  mongoose.connect(config.MONGO_URL, {}, (err) => {
    if (err) {
      throw err;
    } else {
      console.log('Connected to MongoDB');
    }
  });
});

module.exports = server;
