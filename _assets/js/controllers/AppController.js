(function (angular) {
  var guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  angular.module('wfd').controller('wfd-app', function ($scope, $http, $mdSidenav, socket) {
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
    $scope.mealPromise = $http.get('/plans/' + planId);
    $scope.mealPromise.success(function (plan) {
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

    $scope.clientId = guid();

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

    socket.on('ingredientsupdate', function (data) {
      var parts = data.path.split(':'),
          i = 0,
          tmp = $scope.plan;

      // Bail early if we were the initiator of this update
      if (data.clientId === $scope.clientId) {
        return;
      }

      // Get reference to the ingredients object
      for(i; i < parts.length - 1; i++) {
        tmp = tmp[parts[i]];
      }

      // Add or remove the ingredients from the server
      $scope.$apply(function () {
        if (data.action === 'add') {
          data.ingredients.forEach(function (item) {
            tmp.ingredients.push(item);
          });
        } else {
          tmp.ingredients = tmp.ingredients.filter(function (item) {
            return data.ingredients.indexOf(item) < 0;
          });
        }
      });
    });

  });

}(window.angular));
