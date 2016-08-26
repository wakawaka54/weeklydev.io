import "babel-polyfill";

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
import config from 'config';

import { getRoutes } from './api';

const server = new Hapi.Server();
import { startSchedule, runMatch } from './Matching';

global.PATH = process.env.PWD || process.cwd();

// Setup hapi server
server.connection({
  port: config.get('http.port'),
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
        'title': 'API Documentation',
        'version': Pack.version
      },
      pathPrefixSize: 2,
      securityDefinitions: {
        'bearer': {
          'type': 'apiKey',
          'name': 'Authorization',
          'in': 'header'
        }
      }
    }
  }], {
  // Add prefix to the route
  routes: {
    prefix: '/v1'
  }
}, (err) => {

  server.auth.strategy('jwt', 'jwt', {
    key: config.get('jwt'),
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
  getRoutes('v1').forEach(r => server.route(r));

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

// set mongo promse to use bluebird
mongoose.Promise = require('bluebird');

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  } else {
    console.log('Server started on port ' + config.get('http.port'));
  }
  // Make a connection to the mongodb server
  let mongoURI = 'mongodb://';
  if (config.has('mongo.auth') && config.has('config.auth.user') && config.has('config.auth.pass')) {
    mongoURI += `${config.get('mongo.auth.user')}:${config.get('mongo.auth.pass')}@`;
  }
  mongoURI += `${config.get('mongo.host')}:${config.get('mongo.port')}/${config.get('mongo.name')}`;
  mongoose.connect(mongoURI, {}, (err) => {
    if (err) {
      throw err;
    } else {
      console.log('Connected to MongoDB at', mongoURI);
      // schedule Matchmaking every 12 PM (24H)
      //console.log('Starting Matchmaking Schedule');
      if(process.env.NODE_ENV != 'test')
      {
        console.log('Starting matchmaking...');
        //runMatch();
      }
    }
  });
});

module.exports = server;
