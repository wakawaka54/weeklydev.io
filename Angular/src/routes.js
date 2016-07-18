export default routesConfig;

// Import Components
import { login } from './app/components/Login/login.component'

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('app', {
      url: '/',
      template: '<app></app>'
    })
    .state('login', login);
}
