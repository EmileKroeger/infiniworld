angular.module('infiniworld')
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
        } else if ($scope.temperature < 0.2){
          biome = "tundra";
          glyph = "::";
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
