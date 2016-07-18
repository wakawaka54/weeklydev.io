// Angular
import angular from 'angular';
import 'angular-ui-router';

// Main App and Routes
import { MainApp } from './app/app';
import routesConfig from './routes';

// Require Main SCSS
import './index.scss';

angular
  .module('app', ['ui.router'])
  .config(routesConfig)
  .component('app', MainApp);
