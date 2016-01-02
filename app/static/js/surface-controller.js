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
  .controller('SurfaceController', ['$scope', '$routeParams', 'sWorldModel', 'sStringGen', 'sScrollControl', '$window',
  function ($scope, $routeParams, sWorldModel, sStringGen, sScrollControl, $window) {
    var x0 = parseInt($routeParams.x);
    var y0 = parseInt($routeParams.y);
    $scope.world = sWorldModel;
    $scope.scroll = sScrollControl;
    $scope.loaded = false;
    sStringGen.load(function() {
      $scope.loaded = true;
      updateVisibleChunks(getChunkRect());
    });

    var CHUNK_STEP = 8;
    var CELL_WID = 20;
    var CELL_HEI = 20;
    
    /// utility, can be isolated:
    function compareRects(rA, rB) {
      return (rA.x == rB.x) && (rA.y == rB.y) &&
             (rA.wid == rB.wid) && (rA.hei == rB.hei);
    }
    
    function getVisiblePixelRect() {
      var halfScreenWidth = $window.innerWidth / 2;
      var halfScreenHeight = $window.innerHeight / 2;
      return {
        x: (x0 * CELL_WID - halfScreenWidth - sScrollControl.left),
        y: (y0 * CELL_WID - halfScreenHeight - sScrollControl.top),
        wid: $window.innerWidth,
        hei: $window.innerHeight,
      };
    }
    
    function getContainingRect(innerRect, scale) {
      var x = Math.floor(innerRect.x / scale);
      var y = Math.floor(innerRect.y / scale);
      return {
        x: x,
        y: y,
        wid: Math.ceil((scale * x + innerRect.wid) / scale) - x,
        hei: Math.ceil((scale * y + innerRect.hei) / scale) - y,
      };
    }
    
    function printRect(rect) {
      console.log(["rect", rect.x, rect.y, rect.wid, rect.hei]);
    }
    
    $scope.visibleChunks = [];
    var knownChunks = {};
    
    var neededChunks = [];
    
    function makeChunk(i, j) {
      var chunk = {
        x0: i * CHUNK_STEP,
        y0: j * CHUNK_STEP,
        left: (CELL_WID * CHUNK_STEP * (i - firstChunkRect.x - 1)),
        top: (CELL_HEI * CHUNK_STEP * (j - firstChunkRect.y)),
        cells: [],
      };
      for (var dx=0; dx < CHUNK_STEP; dx++) {
        for (var dy=0; dy < CHUNK_STEP; dy++) {
          var x = chunk.x0 + dx;
          var y = chunk.y0 + dy;
          var left = chunk.left + CELL_WID * dx;
          var top  = chunk.top  + CELL_HEI * dy + 10*(x % 2);
          //For cheap hexagonal: + 10*(x % 2);
          var cell = {
            x: x,
            y: y,
            altitude:    sWorldModel.altitude(x, y),
            population:  sWorldModel.population(x, y),
            temperature: sWorldModel.temperature(x, y),
            humidity:    sWorldModel.humidity(x, y),
            style: {
              "left": left + "px",
              "top" : top + "px",
            },
          };
          chunk.cells.push(cell);
        }
      }
      return chunk;
    }
    
    var firstChunkRect = null;
    var lastChunkRect = null;
    function updateVisibleChunks(chunkRect) {
      if (!firstChunkRect) {
        firstChunkRect = chunkRect;
      }
      lastChunkRect = chunkRect;
      // Clear visible chunks
      $scope.visibleChunks = [];
      neededChunks = [];
      for (var di=0; di <= chunkRect.wid; di++) {
        for (var dj=0; dj < chunkRect.hei; dj++) {
          var ckey = [chunkRect.x + di, chunkRect.y + dj];
          if (knownChunks[ckey]) {
            $scope.visibleChunks.push(knownChunks[ckey]);
          } else {
            neededChunks.push({i: chunkRect.x + di, j: chunkRect.y + dj});
          } 
        }
      }
    }
    
    function checkNeededChunks() {
      if (neededChunks.length) {
        var next = neededChunks.shift()
        var chunk = makeChunk(next.i, next.j);
        var ckey = [next.i, next.j];
        knownChunks[ckey] = chunk;
        $scope.$apply(function() {
          $scope.visibleChunks.push(chunk);
        });
      }
    }
    setInterval(checkNeededChunks, 200);
    
    function getChunkRect() {
      var visible = getVisiblePixelRect()
      var rect = getContainingRect(visible, CELL_WID * CHUNK_STEP);
      return rect;
    }
    
    sScrollControl.onMoved( function (){
      // Recalculate if new chunks are needed.
      var chunkRect = getChunkRect();
      if (!compareRects(chunkRect, lastChunkRect)) {
        updateVisibleChunks(chunkRect);
      }
    });

    // Cell selection handling
    $scope.selectedPos = {'x': x0, 'y': y0};
    $scope.selectedstyle = {visibility: "hidden"};
    $scope.select = function(x, y) {
      $scope.selectedPos = {'x': x, 'y': y};
      if (firstChunkRect) {
        
        var deltaX = -CHUNK_STEP * (firstChunkRect.x + 1); //magic number
        var deltaY = -CHUNK_STEP * firstChunkRect.y;
        
        var left = (x + deltaX) * CELL_WID - 5;
        var top  = (y + deltaY) * CELL_HEI + 10*(x % 2);
        $scope.selectedstyle = {
          'left': left + "px",
          'top': top + "px",
        };
      }
    };
  }]);
