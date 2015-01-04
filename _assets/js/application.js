(function (angular) {

var wfd = angular.module('wfd', ['ngMaterial']);

wfd.controller('wfd-app', function ($scope) {
  $scope.message = "Hello World";
});

}(window.angular));
