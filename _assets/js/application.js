(function (angular) {

var wfd = angular.module('wfd', ['ngMaterial', 'btford.socket-io']);

// Socket factory
wfd.factory('socket', function (socketFactory) { return socketFactory(); });

// Directives

wfd.controller('wfd-app', function ($scope, $http, $mdSidenav, socket) {
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

  var planId = document.location.pathname.slice(1);
  // Empty plan ID. Send user back to start page
  if (!planId) {
    document.location.pathname = "/";
  }

  // Load Meal Plan
  $http.get('/plans/' + planId).success(function (plan) {
    $scope.plan = plan;
  });

  $scope.meals = [
    'Breakfast',
    'Lunch',
    'Dinner',
  ];

  $scope.mealsState = {
    'Breakfast' : true,
    'Lunch'     : true,
    'Dinner'    : true
  };

  $scope.openOptions = function ($event) {
    $mdSidenav('optionswindow').toggle();
    $event.preventDefault();
  };

  $scope.showMeal = function (mealName) {
    return $scope.mealsState[mealName];
  };

  socket.on('mealupdate', function (data) {
    var parts = data.path.split(':'),
        i = 0,
        tmp = $scope.plan;

    // Break apart selectors and drill into the plan
    // until `tmp` is the meal we want to update
    for (i; i < parts.length - 1; i++) {
      tmp = tmp[parts[i]];
    }

    // Use the last part to access the meal property and update it
    tmp[parts[parts.length - 1]] = data.value;
  });

});

wfd.controller('options-controller', function ($scope, $mdSidenav) {
  $scope.close = function () {
    $mdSidenav('optionswindow').close();
  };

  var handleMealState = function (mealName) {
    return function (value) {
      if (angular.isDefined(value)) {
        $scope.mealsState[mealName] = value;
      }
      return $scope.mealsState[mealName];
    };
  };

  $scope.showBreakfast = handleMealState('Breakfast');
  $scope.showLunch     = handleMealState('Lunch');
  $scope.showDinner    = handleMealState('Dinner');
});

var syncMealChange = function (socket, id, path, value) {
  socket.emit('mealchange', {
    id: id,
    path: path,
    value: value
  });
};

wfd.controller('meal-controller', function ($scope, socket) {
  var makeAccessor = function (path) {
    return function (value) {
      if ($scope.plan) {
        if (angular.isDefined(value)) {
          $scope.plan[$scope.day][$scope.meal][path] = value;
        }
        return $scope.plan[$scope.day][$scope.meal][path];
      }

      return '';
    };
  };

  $scope.mealName = makeAccessor('name');
  $scope.mealUrl = makeAccessor('url');
  $scope.mealIngredients = function (value) {
    if ($scope.plan) {
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
    }

    return '';
  };

  $scope.syncMealChange = function (path) {
    var value = $scope["meal" + path[0].toUpperCase() + path.slice(1)]();
    syncMealChange(socket, $scope._id, [$scope.day, $scope.meal, path].join(':'), value);
  };
});

}(window.angular));
