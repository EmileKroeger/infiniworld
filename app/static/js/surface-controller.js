angular.module('infiniworld')
  .controller('SurfaceController', ['$scope', 'sField', '$routeParams',
  function ($scope, sField, $routeParams) {
    $scope.x0 = parseInt($routeParams.x);
    $scope.y0 = parseInt($routeParams.y);
    console.debug([$scope.x0])
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

  	$scope.map = sField.simpleMap($scope.rows, $scope.cols);
    // Eventually: make these correlated
  	var altitude0 = sField.simpleMap(1);
  	$scope.altitude = sField.neighbourMap(altitude0, 6);
  	$scope.population = sField.simpleMap(57);
  	var temperature0 = sField.simpleMap(99);
  	$scope.temperature = sField.neighbourMap(temperature0, 2);
  	var humidity0 = sField.simpleMap(77);
  	$scope.humidity = sField.neighbourMap(humidity0, 4);
    
    $scope.moveMap = function(dx, dy) {
      $scope.x0 += dx;
      $scope.y0 += dy;
      $routeParams.x += dx;
    }
    
    var delta = 4;
    $scope.navarrows = [
      [
        {chr: 'ℝ', dx: -delta, dy: -delta},
        {chr: '℞', dx: 0,      dy: -delta},
        {chr: '℟', dx: delta,  dy: -delta},
      ], 
      [
        {chr: 'ℛ', dx: -delta,  dy: 0},
        {chr: '@', dx: 0,       dy: 0},
        {chr: '™', dx: delta,   dy: 0},
      ], 
      [
        {chr: 'ℜ', dx: -delta, dy: delta},
        {chr: '℡', dx: 0,      dy: delta},
        {chr: '℠', dx: delta,  dy: delta},
      ], 
    ];
    console.debug($scope.navarrows);
    
    function evaluateDistrib(func) {
      var values = {};
      for (y=0; y < 11; y++) {
        for (x = 0; x < 20; x++) {
          var alt = func(x, y);
          var bin = Math.floor(10*alt);
          if (values[bin] == undefined) {
            values[bin] = 0;
          }
          values[bin] += 1;
        }
      }
      for (bin = 0; bin < 11; bin++) {
        console.log([bin, values[bin]]);
      }
    }
    //evaluateDistrib($scope.humidity);
  }]);
