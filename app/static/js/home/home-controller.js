angular.module('infiniworld')
  .service("sScrollControl", function() {
    this.left = 0;
    this.top = 0;
    var dragInit = {
      x: 0,
      y: 0,
    }
    this.dragging = false;
    this.handleMouseDown = function(e) {
      //$scope.offset.left += 10;
      this.dragging = true;
      dragInit.x = e.clientX - this.left;
      dragInit.y = e.clientY - this.top;
    };
    this.handleMouseMove = function(e) {
      if (this.dragging) {
        this.left = e.clientX - dragInit.x;
        this.top = e.clientY - dragInit.y;
        console.log(this.left);
      }
    };
    this.handleMouseUp = function(e) {
      this.dragging = false;
    };    
  })
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
