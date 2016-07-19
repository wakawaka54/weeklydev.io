// Angular
import angular from 'angular';
import uiRouter from 'angular-ui-router';

// Main App and Routes
import { MainApp } from './app/MainApp';
import routesConfig from './routes';

// Require Main SCSS
import './index.scss';

var root = angular
  .module('app', [uiRouter])
  .config(routesConfig)
  .component('app', MainApp)
  .name;

export default root;
