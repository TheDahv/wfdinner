(function (angular) {
  angular.module('wfd').controller('WelcomeController', function ($scope, $http, $location) {
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

    $scope.createPlan = function () {
      $http.post('/')
        .success(function (response) {
          console.log(response);
          $location.path('/plans/' + response._id);
        });
    };
  });
}(window.angular));
