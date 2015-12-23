angular.module('infiniworld')
  .service("sField", function() {
    var zDistrib = gaussian(0, 1);
    //var sample = zDistrib.ppf(Math.random());
    //console.log(sample);
    var seed = 1;
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    function seedrand(_seed) {
      var x = Math.sin(_seed) * 10000;
      return x - Math.floor(x);
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
            sum += zDistrib.ppf(submap(x+dx, y+dy));
          }
        }
        // now "sum" is sampled from distrib of mean 0
        // and variance delta * delta
  		  return zDistrib.cdf(sum / Math.sqrt(delta * delta));
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
    function blend(c1, c2, advance) {
      var result = [];
      for (i = 0; i < 3; i++) {
        result.push((1 - advance) * c1[i] + advance * c2[i]);
      }
      return result;
    }
    function blendrgb(c1, c2, advance) {
      blended = blend(c1, c2, advance);
      return rgb(blended[0], blended[1], blended[2])
    }
    var DARKBLUE = [0.0, 0.0, 0.6];
    var BLUE = [0, 0, 0.9];
    var GREEN = [0, 1, 0];
    var YELLOW = [1, 1, 0];
    var GREY = [0.7, 0.7, 0.7];
    var BROWN = [0.5, 0.4, 0.0]
    
    var controller = function($scope) {
      var biome;
      var glyph = "??";
      var style = {};
      if ($scope.altitude < 0.5) {
        biome = "sea";
        glyph = "~";
        //var blended = blendrgb(DARKBLUE, BLUE, 2*$scope.altitude);
        //style["background-color"] = rgb(0, 0, 0.7);
      } else {
        if ($scope.altitude > 0.9) {
          biome = "mountain";
          glyph = "◭";
          var lowcolor = blend(YELLOW, GREEN, $scope.humidity);
          var advance = 10 * ($scope.altitude - 0.9)
          var blended = blendrgb(lowcolor, GREY, advance);
          style["background-color"] = blended;
        } else {
          var blended = blendrgb(YELLOW, GREEN, $scope.humidity);
          style["background-color"] = blended;
          if (($scope.humidity >= 0.8) && ($scope.altitude < 0.7)) {
            biome = "swamp";
            glyph = "⅋"; // deciduous
            var yellowgreen = blend(YELLOW, GREEN, 0.8);
            var swampiness = 5 * ($scope.humidity - 0.8)
            var blended = blendrgb(yellowgreen, BROWN, swampiness);
            style["background-color"] = blended;
          } else if ($scope.humidity >= 0.5) {
            biome = "forest";
            if ($scope.altitude > 0.7) {
              glyph = "⅊"; //coniferous🌲
            } else {
              glyph = "⅋"; // deciduous
            }
          } else {
            biome = "plains";
            glyph = "::";
          }
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
      templateUrl: 'templates/surfacecell.html',
    };
  }) 
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
  	$scope.altitude = sField.neighbourMap(altitude0, 4);
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
    $scope.navarrows = [
      [
        {chr: 'ℝ', dx: -1, dy: -1},
        {chr: '℞', dx: 0, dy: -1},
        {chr: '℟', dx: 1, dy: -1},
      ], 
      [
        {chr: 'ℛ', dx: -1, dy: 0},
        {chr: '@', dx: 0, dy: 0},
        {chr: '™', dx: 1, dy: 0},
      ], 
      [
        {chr: 'ℜ', dx: -1, dy: 1},
        {chr: '℡', dx: 0, dy: 1},
        {chr: '℠', dx: 1, dy: 1},
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
