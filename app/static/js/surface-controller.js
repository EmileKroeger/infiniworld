angular.module('infiniworld')
  .service("sField", function() {
    var seed = 1;
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    function seedrand(_seed) {
      var x = Math.sin(_seed) * 10000;
      return x - Math.floor(x);
    }
    function renormalize2(value) {
      if (value <= 0.5) {
        return 2 * (value * value);
      } else {
        return 1 - 2 * (1 - value) * (1 - value);
      }
    }
    function renormalize(value, n) {
      // value is the sum of n normal variables
      // wrong:
      normalized = value/n;
      //return normalized;
      while (n > 1) { // incorrect too
      //if (n > 1) {
        normalized = renormalize2(normalized);
        n = n / 2;
      }
      return normalized;
    }
  	this.simpleMap = function(seed) {
  		return function(x, y) {
  		  return seedrand(seed * 29 + x * 999 + y * 77777 + 13 * x * y + 119 * seed * (x + y));
  		};
  	}
    this.neighbourMap = function(submap, delta) {
  		return function(x, y) {
        var sum = 0;
        for (dx=0; dx < delta; dx++) {
          for (dy=0; dy < delta; dy++) {
            sum += submap(x+dx, y+dy);
          }
        }
  		  return renormalize(sum, delta * delta);
  		};
    }
  	return this;
  })
  .directive("infiniworldCell", function() {
    var c255 = function(advance) {
      return Math.round(advance * 255);
    }
    var rgb = function(r, g, b) {
      r = c255(r);
      g = c255(g);
      b = c255(b);
      return "rgb(" + r + ", " + g + ", " + b +")"
    }
    //var distribution = gaussian(0, 1);
    // Take a random sample using inverse transform sampling method.
    //var sample = distribution.ppf(Math.random());
    //console.log(sample);
    function blend(c1, c2, advance) {
      
    }
    var controller = function($scope) {
      var biome;
      var glyph = "??";
      var style = {};
      if ($scope.altitude < 0.5) {
        biome = "sea";
        glyph = "~";
      } else {
        if ($scope.altitude > 0.9) {
          biome = "mountain";
          glyph = "◭";
        } else {
          if ($scope.humidity >= 0.5) {
            biome = "forest";
            glyph = "🌲";
          } else {
            biome = "plains";
            glyph = "::";
          }
          var r = 1 - $scope.humidity;
          var g = 0.8;
          var b = 0.2;
          style["background-color"] = rgb(r, g, b);
        }
      }
      $scope.biome = biome;
      $scope.glyph = glyph;
      $scope.style = style;
    }
    return {
      scope: {
        altitude: '=altitude',
        population: '=population',
        temperature: '=temperature',
        humidity: '=humidity',
      },
      controller: controller,
      // I could have several functions here!
      templateUrl: 'templates/surfacecell.html',
    };
  }) 
  .controller('SurfaceController', ['$scope', 'sField', function ($scope, sField) {
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
  	$scope.altitude = sField.neighbourMap(altitude0, 2);
  	$scope.population = sField.simpleMap(57);
  	var temperature0 = sField.simpleMap(99);
  	$scope.temperature = sField.neighbourMap(temperature0, 2);
  	var humidity0 = sField.simpleMap(77);
  	$scope.humidity = sField.neighbourMap(humidity0, 2);
    //$scope.getCell(x)
    
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
