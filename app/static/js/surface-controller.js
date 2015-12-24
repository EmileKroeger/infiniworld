angular.module('infiniworld')
  .controller('SurfaceController', ['$scope', 'sField', '$routeParams',
  function ($scope, sField, $routeParams) {
    $scope.x0 = parseInt($routeParams.x);
    $scope.y0 = parseInt($routeParams.y);
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
    var memoize = sField.memoize;
    var simpleMap = sField.simpleMap;
    var neighbourMap = sField.neighbourMap;
    
  	var altitude0 = memoize(simpleMap(1));
  	$scope.altitude = memoize(neighbourMap(altitude0, 6));
  	$scope.population = memoize(simpleMap(57));
  	var temperature0 = memoize(simpleMap(99));
  	$scope.temperature = memoize(neighbourMap(temperature0, 4));
  	var humidity0 = memoize(simpleMap(77));
  	$scope.humidity = memoize(neighbourMap(humidity0, 4));
    
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
