(function (angular) {
  var guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  angular.module('wfd').controller('IngredientsController', function ($scope, $routeParams, $http, socket) {
    $scope.clientId = guid();
    $scope.planId   = $routeParams.planId;

    $scope.mealPromise = $http.get('/plans/' + $routeParams.planId);
    $scope.mealPromise.success(function (plan) {
      $scope.plan = plan;
      $scope.ingredients = {};

      Object.keys(plan).sort().forEach(function (day) {
        Object.keys(plan[day]).forEach(function (meal) {
          (plan[day][meal].ingredients || []).forEach(function (ingredient) {
            $scope.ingredients[[day, meal, ingredient.name].join('-')] = {
              id: [day, meal, ingredient.name].join('-'),
              name: ingredient.name,
              checked: ingredient.checked
            };
          });
        });
      });
    });

    $scope.changeIngredientState = function (ingredient) {
      ingredient.clientId = $scope.clientId;
      ingredient.planId   = $scope.planId;
      socket.emit('ingredientcheck', ingredient);
    };

    socket.on('ingredientcheck:update', function (ingredientUpdate) {
      if (ingredientUpdate.clientId !== $scope.clientId) {
        $scope.ingredients[ingredientUpdate.id].checked = ingredientUpdate.checked;
      }
    });
  });

}(window.angular));
