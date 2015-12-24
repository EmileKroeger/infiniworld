angular.module('infiniworld')
  .directive("infiniworldCell", function() {
    var c255 = function(advance) {
      return Math.round(advance * 255);
    }
    var rgb = function(r, g, b) {
      if (g == undefined) {
        // Careful with order!
        g = c255(r[1]);
        b = c255(r[2]);
        r = c255(r[0]);
      } else {
        r = c255(r);
        g = c255(g);
        b = c255(b);
      }
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
      return rgb(blended);
    }
    var DARKBLUE = [0.0, 0.0, 0.6];
    var BLUE = [0, 0, 0.9];
    var GREEN = [0, 1, 0];
    var YELLOW = [1, 1, 0];
    var GREY = [0.7, 0.7, 0.7];
    var WHITE = [1, 1, 1];
    var BROWN = [0.5, 0.4, 0.0];
    
    function blendAbove(color, newcolor, threshold, carac) {
      if (carac > threshold) {
        advance = (carac - threshold) / (1.0 - threshold);
        return blend(color, newcolor, advance);
      } else {
        return color;
      }
    }
    function blendBelow(color, newcolor, threshold, carac) {
      if (carac < threshold) {
        advance = carac / threshold;
        return blend(newcolor, color, advance);
      } else {
        return color;
      }
    }

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
        var vegColor = blend(YELLOW, GREEN, $scope.humidity);
        var altColor = blendAbove(vegColor, GREY, 0.9, $scope.altitude)
        var coldColor = blendBelow(altColor, WHITE, 0.3, $scope.temperature)
        style["background-color"] = rgb(coldColor);
        if ($scope.altitude > 0.9) {
          biome = "mountain";
          if ($scope.population > 0.95) {
            glyph = "⚒";
          } else {
            glyph = "◭";
          }
          var color = blendAbove(vegColor, GREY, 0.9, $scope.altitude)
        } else if ($scope.temperature < 0.2){
          biome = "tundra";
          glyph = "::";
        } else {
          var blended = rgb(vegColor);
          //style["background-color"] = blended;
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
            if ($scope.population > 0.9) {
              if ($scope.population > 0.98) {
                glyph = "♚";
              } else if ($scope.population > 0.94) {
                  glyph = "♜";
              } else {
                glyph = "♟";
              }
              style["color"] = "black";
            }
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
