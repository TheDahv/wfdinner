(function (angular) {
  angular.module('wfd').controller('OptionsController', function ($scope, $mdSidenav) {
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
}(window.angular));
