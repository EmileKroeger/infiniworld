angular.module('infiniworld')
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