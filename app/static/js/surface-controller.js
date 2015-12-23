angular.module('infiniworld')
  .service("sField", function() {
    var seed = 1;
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
  	this.simpleMap = function(rows, cols) {
  		var map = {}
  		angular.forEach(rows, function(row) {
	  		angular.forEach(cols, function(col) {
	  			map[[row, col]] = random()
	  		});
  		});
  		return map;
  	}
  	return this;
  })
  .directive("infiniworldCell", function() {
    return {
      scope: {
        altitude: '=altitude',
        population: '=population',
        temperature: '=temperature',
      },
      templateUrl: 'templates/surfacecell.html',
    };
  }) 
  .controller('SurfaceController', ['$scope', 'sField', function ($scope, sField) {
  	$scope.rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  	$scope.cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  	console.debug(sField);
  	console.debug(sField.simpleMap);

  	$scope.map = sField.simpleMap($scope.rows, $scope.cols);
    // Eventually: make these correlated
  	$scope.altitude = sField.simpleMap($scope.rows, $scope.cols);
  	$scope.population = sField.simpleMap($scope.rows, $scope.cols);
  	$scope.temperature = sField.simpleMap($scope.rows, $scope.cols);
    //$scope.getCell(x)

  }]);
