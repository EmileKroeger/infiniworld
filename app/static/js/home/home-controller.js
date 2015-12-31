angular.module('infiniworld')
  .controller('HomeController', ['$scope', 'sScrollControl',
  function($scope, sScrollControl) {
    // Experiment
    $scope.getColor = function(x, y) {
      return "rgb(100%, " + (10 - x) + "0%, " + (10 - y) + "0%)";
    }
    $scope.testrange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    // scroll handling
    $scope.scroll = sScrollControl;
  }]);
