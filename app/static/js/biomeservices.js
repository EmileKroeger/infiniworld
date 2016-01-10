angular.module('infiniworld')
.service("sWorldModel", function(sField, sDebugParams) {
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
  if (sDebugParams.noCities) {
    this.population = function(i, j) {return 0;}
  }
  
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
.service("sBiomes", function() {
  this.test = function() {
    return "Got sBiomes.";
  };
  this.getBiome = function(cell) {
    if (cell.altitude < 0.5) {
      return "sea";
    } else if (cell.altitude > 0.9) {
      return "mountain";
    } else if (cell.population > 0.5) {
      return "city";
    } else if (cell.temperature < 0.2){
      return "tundra";
    } else if ((cell.humidity >= 0.8) && (cell.altitude < 0.7)) {
      return "swamp";
    } else if (cell.humidity >= 0.5) {
      return "forest";
    } else {
      return "plains";
    }
  };
})
