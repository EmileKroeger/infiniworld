angular.module('infiniworld')
  .service("sField", function() {
  	this.simpleMap = function(rows, cols) {
  		var map = {}
  		angular.forEach(rows, function(row) {
	  		angular.forEach(cols, function(col) {
	  			map[[row, col]] = Math.random()
	  		});
  		});
  		return map;
  	}
  	return this;
  })
  .directive("infiniworldCell", function() {
    return {
      scope: {
        cellData: '=cellData',
      },
      template: 'cell({{10*cellData | number:0}})',
    };
  }) 
  .controller('SurfaceController', ['$scope', 'sField', function ($scope, sField) {
  	$scope.rows = [0, 1, 2, 3, 4, 5];
  	$scope.cols = [0, 1, 2, 3, 4, 5];
  	console.debug(sField);
  	console.debug(sField.simpleMap);

  	$scope.map = sField.simpleMap($scope.rows, $scope.cols);
    //$scope.getCell(x)

  }]);
