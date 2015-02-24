(function (angular, io) {
  var getRoom = function () {
    return document.location.pathname.slice(1);
  };

  var wfd = angular.module('wfd', ['ngRoute', 'ngMaterial', 'btford.socket-io']);

  // Theme configuration
  wfd.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryColor('green')
      .accentColor('blue');
  });

  // Configure routing
  wfd.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/partials/welcome.html',
        controller: 'WelcomeController'
      })
      .when('/plans/:planId', {
        templateUrl: '/partials/planner.html',
        controller: 'AppController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

  // Expose in browser object or other modules to use
  window.wfd = wfd;

}(window.angular, window.io));

//= include controllers/*.js
