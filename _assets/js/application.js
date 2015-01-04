(function (angular) {

var wfd = angular.module('wfd', ['ngMaterial']);

wfd.controller('wfd-app', function ($scope, $mdSidenav) {
  $scope.selectedDay = 'Monday';
  $scope.days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Top-level Meal Plan
  $scope.plan = {
    'Monday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Tuesday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Wednesday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Thursday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Friday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Saturday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    },
    'Sunday': {
      'Breakfast' : { name: '', url: '', ingredients: [] },
      'Lunch'     : { name: '', url: '', ingredients: [] },
      'Dinner'    : { name: '', url: '', ingredients: [] }
    }
  };

  $scope.meals = [
    'Breakfast',
    'Lunch',
    'Dinner'
  ];

  $scope.openOptions = function ($event) {
    $mdSidenav('optionswindow').toggle();

    $event.preventDefault();
  };
});

wfd.controller('options-controller', function ($scope, $mdSidenav) {
  $scope.close = function () {
    $mdSidenav('optionswindow').close();
  };
});

wfd.controller('meal-controller', function ($scope) {
  var makeAccessor = function (path) {
    return function (value) {
      if (angular.isDefined(value)) {
        $scope.plan[$scope.day][$scope.meal][path] = value;
      }
      return $scope.plan[$scope.day][$scope.meal][path];
    };
  };

  $scope.mealName = makeAccessor('name');
  $scope.mealUrl = makeAccessor('url');
  $scope.mealIngredients = function (value) {
    if (angular.isDefined(value)) {
      $scope.plan[$scope.day][$scope.meal].ingredients = value
        // Break input into individual items by line breaks or commas
        .split(/,|\n|\r\n/)
        // Clean up any extra whitespace
        .map(function (ingredient) {
          return ingredient.trim();
        });
    }

    return $scope.plan[$scope.day][$scope.meal].ingredients.join('\n');
  };

});

}(window.angular));
