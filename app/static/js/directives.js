angular.module('infiniworld')
  .directive("infiniworldCellInfo", function() {
    var controller = function($scope, sBiomes, sCities) {
      var refresh = function() {
        $scope.biome = sBiomes.getBiome($scope.cell);
        if ($scope.biome == "city") {
          $scope.city = sCities.get($scope.world, $scope.pos);
        } else {
          $scope.city = null;
        }
      };
      $scope.$watch("pos", function() {
        refresh()
      });
    };
    return {
      scope: {
        cell: "=cell",
        pos: "=pos",
        world: "=world",
      },
      controller: controller,
      templateUrl: 'templates/cellinfo.html',
    };
  })
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
    var DARKBLUE = [0.0, 0.0, 0.8];
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
    var controller = function($scope, sBiomes) {
      calculate($scope, sBiomes);
      if ($scope.dynamic) {
        $scope.$watch("altitude", function() {
          // Hack assume altitude changes when we click
          // true 99.9% of the time, otherwise click elsewhere
          calculate($scope, sBiomes);
        })
      }
      function updateSelected() {
        if ($scope.selected) {
          $scope.style.border = "1px solid red";
          $scope.style["line-height"] = "18px";
        } else {
          $scope.style.border = "";
          $scope.style["line-height"] = "20px";
        }
      }
      $scope.$watch("selected", updateSelected);
      updateSelected();
    }

    var calculate = function($scope, sBiomes) {
      var biome = sBiomes.getBiome($scope);
      var glyph = "??";
      var style = {};
      var overglyph = null;
      var overstyle = {};
      if (biome == "sea") {
        glyph = "~";
        var waveColor = blendrgb(DARKBLUE, BLUE, 2*$scope.altitude);
        style["bcolor"] = waveColor;
      } else {
        var vegColor = blend(YELLOW, GREEN, $scope.humidity);
        var altColor = blendAbove(vegColor, GREY, 0.9, $scope.altitude)
        var coldColor = blendBelow(altColor, WHITE, 0.3, $scope.temperature)
        style["background-color"] = rgb(coldColor);
        if (biome == "mountain") {
          if ($scope.population > 0.95) {
            glyph = "⚒";
          } else {
            glyph = "◭";
          }
          var color = blendAbove(vegColor, GREY, 0.9, $scope.altitude)
        } else if (biome == "tundra"){
          glyph = "::";
        } else if (biome == "swamp") {
          if ($scope.temperature < 0.4) {
            glyph = "::";
          } else if ($scope.temperature < 0.6) {
            glyph = "≚";
          } else {
            glyph = "⅋"; // deciduous
          }
          var swampColor = blendAbove(coldColor, BROWN, 0.8, $scope.humidity);
          style["background-color"] = rgb(swampColor);
        } else if (biome == "forest") {
          if ($scope.temperature < 0.5) {
            glyph = "⅊"; //coniferous🌲
          } else {
            glyph = "⅋"; // deciduous
          }
        } else if (biome == "city") {
          // Some kind of habitation
          if ($scope.population > 0.98) {
            glyph = "♚";
            overglyph = "♔";
          } else if ($scope.population > 0.94) {
            glyph = "♜";
            overglyph = "♖";
          } else {
            glyph = "♟";
            overglyph = "♙";
          }
          // And i's temperature-dependant color
          if ($scope.temperature > 0.7) {
            style["color"] = "white";
            overstyle["color"] = "blue";
          } else if ($scope.temperature > 0.3) {
            style["color"] = "grey";
            overstyle["color"] = "black";
          } else {
            style["color"] = "black";
            overglyph = null;
          }
        } else if (biome == "plains"){
          glyph = "::";
        }
      }
      $scope.biome = biome;
      $scope.glyph = glyph;
      $scope.style = style;
      $scope.overglyph = overglyph;
      $scope.overstyle = overstyle;
    }
    return {
      scope: {
        altitude: '=altitude',
        population: '=population',
        temperature: '=temperature',
        humidity: '=humidity',
        dynamic: '=dynamic',
        selected: '=selected',
      },
      controller: controller,
      templateUrl: 'templates/surfacecell.html',
    };
  }) 
