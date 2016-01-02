angular.module('infiniworld')
.service("sRandomUtils", function() {
  var KEYWORD_RE = /\[([\w ]+)\]/g;
  self = this;
  this.pick = function pick(list, key) {
    return list[Math.floor((key % 1) * list.length)];
  };
  this.flip = function pick(list, key) {
    return (key % 1) < 0.5;
  };
  // Helper function for recursively replacing from a dictionary.
  this.build = function build(dic, name, key) {
    var result = self.pick(dic[name], key);
    result = result.replace(KEYWORD_RE, function(m, w) {
      key = (key + 0.3) * 11;
      return self.build(dic, w, key);
    });
    return result;
  };
  this.hash = function(a, b) {
    var result = ((a << 5) - a) + b;
    return result |= 0; // Convert to 32bit integer
  }
})
.service("sField", function() {
  var zDistrib = gaussian(0, 1);
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
  // This assumes square tiling. We want hexagonal...
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
  // This will need some work to work with hexagons...
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
  // assumes square tiling, but we can be hexagonal
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