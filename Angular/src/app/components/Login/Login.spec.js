import angular from 'angular';
import 'angular-mocks';
import {login} from './Login';

describe('login component', () => {
  beforeEach(() => {
    angular
      .module('login', ['app/components/Login//Login.html'])
      .component('login', login);
    angular.mock.module('login');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<login></login>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
