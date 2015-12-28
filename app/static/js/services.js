angular.module('infiniworld')
.service("sRandomUtils", function() {
  var KEYWORD_RE = /\[([\w ]+)\]/g;
  self = this;
  this.pick = function pick(list, key) {
    return list[Math.floor((key % 1) * list.length)];
  }
  this.flip = function pick(list, key) {
    return (key % 1) < 0.5;
  }
  this.build = function build(dic, name, key) {
    var result = self.pick(dic[name], key);
    result = result.replace(KEYWORD_RE, function(m, w) {
      key = (key + 0.3) * 11;
      return self.build(dic, w, key);
    })
    return result;
  }
})
.service("sStringGen", function($http, sRandomUtils) {
  var data = {};
  this.data = data;
  this.load = function(callback) {
    var sources = ["fantasyregion", "townnames", "pairednames",
                   "splats"];
    var pending = sources.length;
    angular.forEach(sources, function(source) {
      $http.get("data/" + source + ".json").then(function(r) {
        data[source] = r.data;
        pending -= 1;
        if (!pending) {
          callback();
        }
      });
    });
  };
  this.generate = function(source, name, key) {
    return sRandomUtils.build(this.data[source], name, key);
  };
  this.townname = function(key) {
    var source;
    if (key < 0.5) {
      source = "townnames";
    } else {
      source = "pairednames";
    }
    key = 2 * key;
    return this.generate(source, "main", key);
  };
  this.fantasyregion = function(key) {
    return this.generate("fantasyregion", "main", key);
  };
  this.faction = function(key) {
    return this.generate("splats", "main", key);
  };
})
.service("sCultures", function(sField, sStringGen, sRandomUtils) {
  var NATIONKINDS = ["Kingdom", "Kingdom", "Empire", "Republic",
                     "Kingdom", "Kingdom", "Empire", "Republic",
                     "Confederacy", "Grand-duchy"];
  var RACES = ["Human", "Human", "Human", "Elf", "Elf", "Dwarf",
               "Orc", "Goblin"];
  var COLOR_PAIRS = [
    ["red", "white"],
    ["red", "yellow"],
    ["red", "blue"],
    ["red", "black"],
    ["blue", "white"],
    ["blue", "black"],
    ["lightblue", "black"],
    ["blue", "yellow"],
    ["green", "white"],
    ["green", "yellow"],
    ["green", "black"],
    ["lightgreen", "black"],
    ["purple", "white"],
    ["purple", "black"],
    ["yellow", "black"],
    ["white", "black"],
    ["white", "blue"],
    ["grey", "blue"],
  ]
  var FLAG_PATTERNS = [
    "linear-gradient(to right, COLA, COLA 50%, COLB 50%, COLB)",
    "linear-gradient(to bottom, COLA, COLA 50%, COLB 50%, COLB)",
    "linear-gradient(to right, COLA, COLA 33%, COLB 33%, COLB 67%, COLA 67%, COLA)",
  ];
  var keyField = sField.simpleMap(43);
  var raceKeyField = sField.simpleMap(87);
  var kindKeyField = sField.simpleMap(711);
  var nameKeyField = sField.simpleMap(817);
  var colorKeyField = sField.simpleMap(17);
  var INFLUENCE_RANGE = 2;
  this.getMainColor = function(key) {
    // Must be same logic as below!
    return sRandomUtils.pick(COLOR_PAIRS, key * 2)[0];
  }
  this.makeColors = function(key) {
    var colors = sRandomUtils.pick(COLOR_PAIRS, key * 2);
    var pattern = sRandomUtils.pick(FLAG_PATTERNS, key);
    var colA = colors[0];
    var colB = colors[1];
    if (sRandomUtils.flip(key*38)) {
      colA = colors[1];
      colB = colors[0];
    }
    return pattern.replace(/COLA/g, colA).replace(/COLB/g, colB);
  }
  this.getCulture = function(i, j) {
    var culture = {};
    var key = keyField(i, j);
    if (key > 0.8) {
      // Nation! For now, simple.
      var kind = sRandomUtils.pick(NATIONKINDS, kindKeyField(i, j));
      var basename = sStringGen.townname(nameKeyField(i, j));
      culture["nation"] = {
        name: kind + " of " + basename,
        maincolor: this.getMainColor(colorKeyField(i, j)),
        colors: this.makeColors(colorKeyField(i, j)),
      }
      if (key > 0.85) {
        culture["race"] = sRandomUtils.pick(RACES, raceKeyField(i, j))
      }
    }
    else if (key > 0.6) {
      culture["race"] = sRandomUtils.pick(RACES, raceKeyField(i, j))
    }
    // Also possible: religion, conspiracies, ancient empires
    culture.influence = 0.1 + key;
    return culture;
  }
  this.getMostInfluent = function(pos, attribute) {
    var i0 = Math.floor(pos.x / 8);
    var j0 = Math.floor(pos.y / 8);
    var closestIDist = 100000000;
    var mostInfluent = null;
    for (di = -INFLUENCE_RANGE; di <= INFLUENCE_RANGE; di++) {
      for (dj = -INFLUENCE_RANGE; dj <= INFLUENCE_RANGE; dj++) {
        var culture = this.getCulture(i0 + di, j0 + dj);
        if (culture[attribute]) {
          var dist2 = di*di + dj*dj;
          // This means even a culture with no influence will
          // win at dist = 0
          var iDist = dist2 / culture.influence;
          if ((iDist < closestIDist) || (closestIDist == -1)) {
            mostInfluent = culture[attribute];
          }
        }
      }
    }
    return mostInfluent;
  }
  
  this.getNation = function(pos) {
    return this.getMostInfluent(pos, "nation");
    // If no nation, it'll be a city-state.
  };
  this.getRace = function(pos) {
    return this.getMostInfluent(pos, "race");
    // If no nation, it'll be a city-state.
  };
})
.service("sCities", function(sField, sStringGen, sCultures) {
  var keyField = sField.simpleMap(117);
  var knownCities = {}
  this.get = function(world, pos) {
    var posv = [pos.x, pos.y];
    if (!knownCities[posv]) {
      var key = keyField(pos.x, pos.y);
      var city = {
        nation: sCultures.getNation(pos),
        name: sStringGen.townname(key),
        race: sCultures.getRace(pos),
      };
      // All this is not necessary for 'map' cities, could be optimized
      // away
      var descr = sStringGen.fantasyregion(key);
      var head_tail = descr.split("<ul><li>");
      city.description = head_tail[0];
      city.features = head_tail[1].split("<li>");
      city.factions = [sStringGen.faction(key)]
      knownCities[posv] = city;
    }
    return knownCities[posv];
  };
})
.service("sBiomes", function() {
  this.test = function() {
    return "Got sBiomes..";
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
  }
})
.service("sField", function() {
  var zDistrib = gaussian(0, 1);
  //var sample = zDistrib.ppf(Math.random());
  //console.log(sample);
  var seed = 1;
  function random() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  };
  function seedrand(_seed) {
    var x = Math.sin(_seed) * 10000;
    return x - Math.floor(x);
  };
	this.simpleMap = function(seed) {
		return function(x, y) {
		  return seedrand(seed * 29 + x * 999 + y * 77777 + 13 * x * y + 119 * seed * (x + y));
		};
	};
  this.neighbourMap = function(submap, delta) {
    var stdv = Math.sqrt(delta * delta);
		return function(x, y) {
      var sum = 0;
      for (dx=0; dx < delta; dx++) {
        for (dy=0; dy < delta; dy++) {
          sum += zDistrib.ppf(submap(x+dx, y+dy));
        }
      }
      // now "sum" is sampled from distrib of mean 0
      // and variance delta * delta
		  return zDistrib.cdf(sum / stdv);
		};
  };
  this.lattitudeOnly = function(seed) {
    return function(x, y) {
		  return seedrand(seed * 13 + y * 421 + 719 * seed * y);
    }
  }
  this.lattitudeAverage = function(submap, delta) {
    var stdv = Math.sqrt(delta);
		return function(x, y) {
      var sum = 0;
      for (dy=0; dy < delta; dy++) {
        sum += zDistrib.ppf(submap(x, y+dy));
      }
      // now "sum" is sampled from distrib of variance delta
		  return zDistrib.cdf(sum / stdv);
		};
  };
  this.weightedSum = function(fieldA, weightA, fieldB, weightB) {
    var stdv = Math.sqrt(weightA * weightA + weightB * weightB);
    return function(x, y) {
      var sum = weightA * zDistrib.ppf(fieldA(x, y)) +
                weightB * zDistrib.ppf(fieldB(x, y));
      // Now sum is sampled from distrib of variance
      return zDistrib.cdf(sum / stdv);
    }
  };
  this.peakFilter = function(field, dist) {
    return function(x, y) {
      var value = field(x, y);
      for (dy = -dist; dy < (dist + 1); dy++) {
        for (dx = -dist; dx < (dist + 1); dx++) {
          if (field(x + dx, y + dy) > value) {
            return 0;
          }
        }
      }
      return value;
    }
  }
  this.cutIfBelow = function(field, criteriaField, threshold) {
    return function(x, y) {
      if (criteriaField(x, y) < threshold) {
        return 0;
      } else {
        return field(x, y)
      }
    }
  }
  
  this.memoize = function(f) {
    f.memo = {};
    return function () {
       var args = Array.prototype.slice.call(arguments);
       return (args in f.memo) ? f.memo[args] :
                      f.memo[args] = f.apply(this, args);
   };
 }
	return this;
})