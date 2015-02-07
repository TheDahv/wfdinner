(function (angular, io) {

var guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

var wfd = angular.module('wfd', ['ngMaterial', 'btford.socket-io']);

var getRoom = function () {
  return document.location.pathname.slice(1);
};

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

var syncIngredientsChange = function (socket, id, clientId, path, ingredients, action) {
  socket.emit('ingredientschange', {
    id: id,
    clientId: clientId,
    path: path,
    ingredients: ingredients || [],
    action: action || 'add'
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

  // Cache over last-known value (or, our init value on startup)
  // for use in determining which ingredients have been added or removed
  $scope.mealPromise.then(function () {
    $scope.lastMealIngredients = $scope.plan[$scope.day][$scope.meal].ingredients;
  });

  $scope.syncMealChange = function (path) {
    var value = $scope["meal" + path[0].toUpperCase() + path.slice(1)]();
    syncMealChange(socket, getRoom(), [$scope.day, $scope.meal, path].join(':'), value);
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
      syncIngredientsChange(socket, getRoom(), $scope.clientId, path, added, 'add');
    }
    if (removed.length) {
      syncIngredientsChange(socket, getRoom(), $scope.clientId, path, removed, 'remove');
    }

    // Update last-known ingredients for next time this function runs
    $scope.lastMealIngredients = newIngredients;
  };

});

wfd.controller('wfd-welcome', function ($scope) {
  $scope.playDemo = function ($event) {
    $event.preventDefault();
    var demoWindow = welcomeForm.querySelector('.browserChrome .content');
    var overlay = welcomeForm.querySelector('.browserChrome .overlay');
    var video = document.createElement('video');

    video.src = "/img/wfd-demo.mp4";
    video.loop = true;
    video.controls = true;
    video.style.width = "100%";
    video.oncanplay = function () {
      demoWindow.replaceChild(video, demoWindow.firstElementChild);
      video.play();
      overlay.classList.add("isPlaying");
    };
  };
});

}(window.angular, window.io));
