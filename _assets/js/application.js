(function (angular, io) {
  var getRoom = function () {
    return document.location.pathname.slice(1);
  };

  var wfd = angular.module('wfd', ['ngMaterial', 'btford.socket-io']);

  // Theme configuration
  wfd.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryColor('green')
      .accentColor('blue');
  });

  // Socket factory
  wfd.factory('socket', function (socketFactory) {
    var socket = io.connect('/');
    socket.emit('room:join', getRoom());

    return socketFactory({
      ioSocket: socket
    });
  });

  // Expose in browser object or other modules to use
  window.wfd = wfd;

}(window.angular, window.io));

//= include controllers/*.js
