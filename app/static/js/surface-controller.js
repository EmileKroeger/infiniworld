angular.module('infiniworld')
  .service("sWorldModel", function(sField) {
    var memoize = sField.memoize;
    var simpleMap = sField.simpleMap;
    var neighbourMap = sField.neighbourMap;

    // Altitude
  	var altitude0 = simpleMap(1);
  	this.altitude = neighbourMap(altitude0, 6);
    // Temperature
  	var temperature0 = sField.lattitudeOnly(99);
  	var temperature1 = sField.lattitudeAverage(temperature0, 6);
  	this.temperature = sField.weightedSum(temperature1, 1, this.altitude, -1);

  	var humidity0 = memoize(simpleMap(77));
  	this.humidity = memoize(neighbourMap(humidity0, 4));

    population0 = simpleMap(57);
    population1 = sField.cutIfBelow(population0, this.altitude, 0.5);
  	this.population = sField.peakFilter(population0, 2);
    
    var knownCells = {};
    
    this.getCell = function(pos) {
      // Could be a good place to do the normalization thing.
      //return this.knownCells;
      var key = [pos.x, pos.y];
      if (knownCells[key] == undefined) {
        knownCells[key] = {
          altitude: this.altitude(pos.x, pos.y),
          temperature: this.temperature(pos.x, pos.y),
          humidity: this.humidity(pos.x, pos.y),
          population: this.population(pos.x, pos.y),
        };
      }
      return knownCells[key];
    };
  })
  .controller('SurfaceController', ['$scope', '$routeParams', 'sWorldModel',
  function ($scope, $routeParams, sWorldModel) {
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
    // Cell selection handling
    $scope.selectedPos = {'x': $scope.x0, 'y': $scope.y0};
    $scope.select = function(x, y) {
      $scope.selectedPos = {'x': x, 'y': y};
    };
    
    $scope.world = sWorldModel;

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
    //evaluateDistrib(world.humidity);
  }]);
