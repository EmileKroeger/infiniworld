angular.module('infiniworld')
  .directive("infiniworldCellInfo", function() {
    var controller = function($scope, sBiomes, sCities) {
      var refresh = function() {
        $scope.biome = sBiomes.getBiome($scope.cell);
        if ($scope.biome == "city") {
          $scope.city = sCities.get($scope.world, $scope.pos);
          $scope.nationdesc = sCities.getNationDesc($scope.city.nation);
          $scope.nationfeatures = sCities.getNationFeatures($scope.city.nation);
        } else {
          $scope.city = null;
          $scope.nationdesc = null;
          $scope.nationfeatures = [];
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
    var controller = function($scope, sBiomes, sCities) {
      calculate($scope, sBiomes, sCities);
      if ($scope.dynamic) {
        $scope.$watch("altitude", function() {
          // Hack assume altitude changes when we click
          // true 99.9% of the time, otherwise click elsewhere
          calculate($scope, sBiomes, sCities);
        })
      } 
    }

    var calculate = function($scope, sBiomes, sCities) {
      var biome = sBiomes.getBiome($scope.cell);
      var glyph = "??";
      var style = {};
      var overglyph = null;
      var overstyle = {};
      var cell = $scope.cell; 
      if (biome == "sea") {
        glyph = "~";
        var waveColor = blendrgb(DARKBLUE, BLUE, 2*cell.altitude);
        style["background-color"] = "rgb(0%, 0%, 80%)";
        style["bcolor"] = waveColor;
      } else {
        var vegColor = blend(YELLOW, GREEN, cell.humidity);
        var altColor = blendAbove(vegColor, GREY, 0.9, cell.altitude)
        var coldColor = blendBelow(altColor, WHITE, 0.3, cell.temperature)
        style["background-color"] = rgb(coldColor);
        if (biome == "mountain") {
          if (cell.population > 0.95) {
            glyph = "⚒";
          } else {
            glyph = "◭";
          }
          var color = blendAbove(vegColor, GREY, 0.9, cell.altitude)
        } else if (biome == "tundra"){
          glyph = "::";
        } else if (biome == "swamp") {
          if (cell.temperature < 0.4) {
            glyph = "::";
          } else if (cell.temperature < 0.6) {
            glyph = "≚";
          } else {
            glyph = "⅋"; // deciduous
          }
          var swampColor = blendAbove(coldColor, BROWN, 0.8, cell.humidity);
          style["background-color"] = rgb(swampColor);
        } else if (biome == "forest") {
          if (cell.temperature < 0.5) {
            glyph = "⅊"; //coniferous🌲
          } else {
            glyph = "⅋"; // deciduous
          }
        } else if (biome == "city") {
          // Some kind of habitation
          if ($scope.world && $scope.pos) {
            // Actually we use this as a cheapo way of knowing whether we
            // need a city.
            $scope.city = sCities.get($scope.world, $scope.pos);
          }
          if (cell.population > 0.98) {
            glyph = "♚";
            overglyph = "♔";
          } else if (cell.population > 0.94) {
            glyph = "♜";
            overglyph = "♖";
          } else {
            glyph = "♟";
            overglyph = "♙";
          }
          // And i's temperature-dependant color
          if (cell.temperature > 0.7) {
            style["color"] = "white";
            overstyle["color"] = "blue";
          } else if (cell.temperature > 0.3) {
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
      $scope.color = style["background-color"]
      $scope.overglyph = overglyph;
      $scope.overstyle = overstyle;
    }
    return {
      scope: {
        world: '=world',
        pos: '=pos',
        cell: '=cell',
        dynamic: '=dynamic',
        selected: '=selected',
      },
      controller: controller,
      templateUrl: function(elem, attrs) {
        if (attrs.dynamic == "true") {
          return 'templates/dynamiccell.html';
        } else {
          return 'templates/surfacecell.html';
        }
      },
    };
  }) 
