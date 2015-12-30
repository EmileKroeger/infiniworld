angular.module('infiniworld')
  .controller('HomeController', ['$scope', function ($scope) {
    
    
    // Experiment
    $scope.getColor = function(x, y) {
      return "rgb(100%, " + (10 - x) + "0%, " + (10 - y) + "0%)";
    }
    $scope.testrange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.offset = {
      left: 0,
      top: 0,
    }
    var dragInit = {
      x: 0,
      y: 0,
    }
    $scope.dragging = false;
    $scope.handleMouseDown = function(e) {
      //$scope.offset.left += 10;
      $scope.dragging = true;
      dragInit.x = e.clientX - $scope.offset.left;
      dragInit.y = e.clientY - $scope.offset.top;
    };
    $scope.handleMouseMove = function(e) {
      if ($scope.dragging) {
        $scope.offset.left = e.clientX - dragInit.x;
        $scope.offset.top = e.clientY - dragInit.y;
      }
    };
    $scope.handleMouseUp = function(e) {
      $scope.dragging = false;
    };
  }]);
