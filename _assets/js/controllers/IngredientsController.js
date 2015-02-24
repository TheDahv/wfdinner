(function (angular) {
  angular.module('wfd').controller('IngredientsController', function ($scope, $routeParams, $http) {
    $scope.mealPromise = $http.get('/plans/' + $routeParams.planId);
    $scope.mealPromise.success(function (plan) {
      $scope.plan = plan;
      $scope.ingredients = [];
      Object.keys(plan).forEach(function (day) {
        Object.keys(plan[day]).forEach(function (meal) {
          (plan[day][meal].ingredients || []).forEach(function (ingredient) {
            $scope.ingredients.push(ingredient);
          });
        });
      });
      $scope.ingredients.sort();
    });

    /*
    var ingredientsChecklist = {};
    $scope.ingredientsChecklist = function (value) {
      if (angular.isDefined(value)) {
        ingredientsChecklist
      }

      return ingredientsChecklist;
    }
    */
  });

}(window.angular));
