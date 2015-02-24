(function (angular) {
  var getRoom = function (plan) {
    return plan._id;
  };

  var syncMealChange = function (socket, id, path, value) {
    socket.emit('mealchange', {
      id: id,
      path: path,
      value: value
    });
  };

  var syncIngredientsChange = function (socket, id, clientId, path, ingredients, action) {
    socket.emit('ingredientschange', {
      id: id,
      clientId: clientId,
      path: path,
      ingredients: ingredients || [],
      action: action || 'add'
    });
  };

  angular.module('wfd').controller('MealController', function ($scope, socket) {
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

    // Cache over last-known value (or, our init value on startup)
    // for use in determining which ingredients have been added or removed
    $scope.mealPromise.then(function () {
      $scope.lastMealIngredients = $scope.plan[$scope.day][$scope.meal].ingredients;
    });

    $scope.syncMealChange = function (path) {
      var value = $scope["meal" + path[0].toUpperCase() + path.slice(1)]();
      syncMealChange(socket, getRoom($scope.plan), [$scope.day, $scope.meal, path].join(':'), value);
    };

    $scope.syncIngredientsChange = function () {
      var path = [$scope.day, $scope.meal, 'ingredients'].join(':'),
          newIngredients,
          old, added, removed, notIn;

      newIngredients = $scope.mealIngredients().split('\n')
        // Drop any empty ingredients
        .filter(function (ingredient) {
          return ingredient.length > 0;
        });

      notIn = function (array) {
        return function (elem) {
          return array.indexOf(elem) < 0;
        };
      };

      old     = $scope.lastMealIngredients;
      added   = newIngredients.filter(notIn(old));
      removed = old.filter(notIn(newIngredients));

      if (added.length) {
        syncIngredientsChange(socket, getRoom($scope.plan), $scope.clientId, path, added, 'add');
      }
      if (removed.length) {
        syncIngredientsChange(socket, getRoom($scope.plan), $scope.clientId, path, removed, 'remove');
      }

      // Update last-known ingredients for next time this function runs
      $scope.lastMealIngredients = newIngredients;
    };

  });
}(window.angular));
