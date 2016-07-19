import angular from 'angular';
import uiRouter from 'angular-ui-router';
import LoginComponent from './login.component';

const login = angular
  .module('login', [
    uiRouter
  ])
  .component('login', LoginComponent)
  .config(($stateProvider, $urlRouterProvider) => {
    $stateProvider
      .state('login', {
        url: '/login',
        component: 'login'
      });
    $urlRouterProvider.otherwise('/');
  })
  .name;

export default login;
