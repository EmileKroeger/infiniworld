angular.module('infiniworld')
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
    if (!this.data[source]) {
      console.debug(["ERROR", source, name, key]);
      return "ERROR"
    }
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
  this.getNationDesc = function(key) {
    return this.generate("fantasyregion", "main_nation", key);
  };
  this.getNationQuality = function(key) {
    return this.generate("fantasyregion", "NationQuality", key);
  };
  this.getNationFeatures = function(key) {
    var mashed = this.generate("fantasyregion", "features_nation", key)
    return mashed.split("<li>");
  };
  this.faction = function(key) {
    return this.generate("splats", "main", key);
  };
})
.service("sGeometry", function() {
  // So, I'm getting an int32
  var N = 2 << 15;
  var MASK = N - 1;
  function mod(x,  m) {
      return ((x % m) + m) % m;
  }
  
  this.encode = function(x, y) {
    return (mod(x, N) << 15) + mod(y, N);
  };
  this.getx = function(poscode) {
    // Bigger digits are x
    return poscode >> 15;
  };
  this.gety = function(poscode) {
    //smaller digits are y
    return poscode & MASK;
  };
})
.service("sCultureFeatures", function(sField, sStringGen, sRandomUtils, sGeometry) {
  function makeFeature(featureId, getter) {
    var field = sField.simpleMap(featureId);
    return function(pos) {
      return getter(pos, field(pos.x, pos.y));
    }
  }
  
  // DATA, to isolate
  var NATIONKINDS = [
    "Kingdom", "Kingdom", "Empire", "Republic",
    "Kingdom", "Kingdom", "Empire", "Republic",
    "Confederacy", "Grand-duchy"
  ];
  var NATIONCITIES = {
    "Kingdom": ["A baronny", "A province", "A duchy"],
    "Empire": ["A province", "A region"],
    "Republic": ["A province"],
    "Confederacy": ["A city-state"],
    "Grand-duchy": ["A baronny"]
  };
  this.NATIONCITIES = NATIONCITIES;
  var NATIONRULERS = {
    "Kingdom": ["a baron", "a duke", "a council of nobles"],
    "Empire": ["a governor", "a consul", "a council", "a magistrate"],
    "Republic": ["a governor", "a mayor", "a council"],
    "Confederacy": ["a prince", "a council of nobles", "an archbishop"],
    "Grand-duchy": ["a magistrate", "a mayor"]
  };
  this.NATIONRULERS = NATIONRULERS;
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
  
  var self = this;

  this.NATIONKIND = makeFeature(711, function(nationpos, key) {
    return sRandomUtils.pick(NATIONKINDS, key);
  });
  
  this.NATIONBASENAME = makeFeature(817, function(nationpos, key) {
    return sStringGen.townname(key);
  });
  
  this.NATIONMAINCOLOR = makeFeature(17, function(nationpos, key) {
    return sRandomUtils.pick(COLOR_PAIRS, key * 2)[0];
  });
  // Same key as above!
  this.NATIONCOLORS = makeFeature(17, function(nationpos, key) {
    var colors = sRandomUtils.pick(COLOR_PAIRS, key * 2);
    var pattern = sRandomUtils.pick(FLAG_PATTERNS, key);
    if (sRandomUtils.flip(key*38)) {
      return pattern.replace(/COLA/g, colors[0]).replace(/COLB/g, colors[1]);
    } else {
      return pattern.replace(/COLA/g, colors[1]).replace(/COLB/g, colors[0]);
    }
  });

  // Nation Features
  this.NATIONBLURB = makeFeature(811, function(nationpos, key) {
    //return sStringGen.getNationDesc(key);
    var quality = sStringGen.getNationQuality(key);
    return "A " + quality + " " + self.NATIONKIND(nationpos);
  });

  this.NATIONFEATURES = makeFeature(201, function(nationpos, key) {
    return sStringGen.getNationFeatures(key);
  });

  var RACES = [
    "Human", "Human", "Human", "Elf", "Elf",
    "Dwarf", "Orc", "Goblin",
  ];

  this.CULTURERACE = makeFeature(87, function(culturePos, key) {
    return sRandomUtils.pick(RACES, key);
  });

  this.CULTURECONSPIRACY = makeFeature(87, function(culturePos, key) {
    return sStringGen.faction(key);
  });


 var WORSHIP_ADJ = ["Ebon", "Burning", "Holy", "Glorious", "Dark", "Bloody",
   "Mystic", "Seventh", "Third", "Safron", "Triple", "Nine-fold",
   "True", "Noble", "Perfect", "First", "Primal", "Shadow", "Second", 
   "Fourth", "Fifth", "Seventh", "Eight", "Ninth", "Tenth", "Twelfth",
   "Untold", "Scarlet", "Crimson", "Vigilant", "Ancient", "Astral", 
   "Black", "Bleeding", "Blessed", "Brazen", "Celestial", "Divine", 
   "Elder", "Enchanted", "Endless", "Enduring", "Eternal", "Fiery",
   "Final", "Forbidden", "Fogotten", "Forsaken", "Golden", "Silver",
   "Hallowed", "Heavenly", "Hidden", "Immortal", "Inner", "Iron", "Ivory",
   "Last", "Lost", "Ineffable", "Naked", "Dark", "Perfect", "Promised",
   "Sacred", "Sleeping", "Stolen", "Sublime", "Supreme", "Ultimate",
   "Undying", "Unseen", "Veiled", "White", "Grey", "Wild", "Seven-fold",
   "Three-fold", "Eight-fold",
]
 
 var WORSHIP_NOUN = ["Lady", "Hand", "Fire", "Lord", "Goddess", "Mystery",
   "Church", "Dawn", "Grove", "Triad", "Truth", "Age", "Ark", "Blade",
   "Cowl", "Chalice", "Circle", "Dream", "Beast", "Shadow", "Riddle",
   "Form", "Heart", "Eye", "Key", "Kingdom", "Law", "Testament", 
   "Commandment", "Doctrine", "Book", "Verse", "Word", "Maiden", "Virgin",
   "Moon", "Morning", "Path", "Gate", "Power", "Rite", "Sigil", "Snake",
   "Sphere", "Star", "Stone", "Sword", "Teaching", "Temple", "Way", "Crown",
   "Cross", "Chaos", "Darkness", "Love", "Spring", "Wing", "Face", "Gem",
   "God", "Secret",
 ]
 WORSHIP_DENIZENS = [
   "A large congregation of worshippers of [WORSHIPOBJECT]",
   "A few worshippers of [WORSHIPOBJECT]",
   "Scattered and dispirited worshippers of [WORSHIPOBJECT]",
   "Enthusiastic new followers of [WORSHIPOBJECT]",
   "Newly anointed disciples of [WORSHIPOBJECT] on their pilgrimage",
   "Priests of [WORSHIPOBJECT], staying away from the things of the world",
   "A holy man, manifesting the virtue of [WORSHIPOBJECT]",
   "A bearded mystic, speaking riddles about [WORSHIPOBJECT]",
   "Heretics, expelled for their blasphemous conception of [WORSHIPOBJECT]",
   "A preacher, spreading the truth of [WORSHIPOBJECT]",
   "Preachers of [WORSHIPOBJECT], mocked by the crowd",
   "Wild-eyed men in rags, speaking in hushed tones of the glory of [WORSHIPOBJECT]",
   "Secret adorers of [WORSHIPOBJECT], meeting at night",
   "Veiled figures, carrying a holy relic of [WORSHIPOBJECT]",
 ]
 this.WORSHIP_DENIZENS = WORSHIP_DENIZENS;

  
  this.CULTUREWORSHIPOBJECT = makeFeature(91, function(culturePos, key) {
    var adjective =  sRandomUtils.pick(WORSHIP_ADJ, key);
    key = key * WORSHIP_ADJ.length;
    var noun = sRandomUtils.pick(WORSHIP_NOUN, key);
    return "the " + adjective + " " + noun; 
  });
})
.service("sNations", function(sCultureFeatures) {
  this.getBasic = function(culturePos) {
    var kind = sCultureFeatures.NATIONKIND(culturePos);
    var basename = sCultureFeatures.NATIONBASENAME(culturePos);
    return {
      i: culturePos.x,
      j: culturePos.y,
      kind: kind,
      basename: basename,
      name: kind + " of " + basename,
      maincolor: sCultureFeatures.NATIONMAINCOLOR(culturePos),
      colors: sCultureFeatures.NATIONCOLORS(culturePos),
    };
  };
  this.getDetailed = function(basicNation) {
    var nationPos = {x: basicNation.i, y: basicNation.j};
    return angular.extend({
      blurb:    sCultureFeatures.NATIONBLURB(nationPos),
      features: sCultureFeatures.NATIONFEATURES(nationPos),
    }, basicNation);
  };
})
.service("sCultures", function(sField, sStringGen, sRandomUtils,
  sCultureFeatures, sNations) {
  // This service maps culture-space to cell-space
  var influenceKeyField = sField.simpleMap(43);
  var INFLUENCE_RANGE = 2;
  this.getCulture = sField.memoize(function(i, j) {
    var culture = {};
    var culturePos = {x: i, y: j};
    var key = influenceKeyField(i, j);
    if (key > 0.8) {
      // Nation! For now, simple.
      culture["nation"] = sNations.getBasic(culturePos);
      if (key > 0.85) {
        culture["race"] = sCultureFeatures.CULTURERACE(culturePos);
      }
    }
    else if (key > 0.6) {
      culture["race"] = sCultureFeatures.CULTURERACE(culturePos);
    } else if (key > 0.5) {
      culture["conspiracy"] = sCultureFeatures.CULTURECONSPIRACY(culturePos);
    } else if (key > 0.455) {
      culture["worship"] = {
        object: sCultureFeatures.CULTUREWORSHIPOBJECT(culturePos),
      }
    }
    // Also possible: religion, ancient empires
    culture.influence = 0.1 + key;
    return culture;
  });
  this.forEachCulture = function(pos, callback) {
    var i0 = Math.floor(pos.x / 8);
    var j0 = Math.floor(pos.y / 8);
    for (di = -INFLUENCE_RANGE; di <= INFLUENCE_RANGE; di++) {
      for (dj = -INFLUENCE_RANGE; dj <= INFLUENCE_RANGE; dj++) {
        var dist2 = di*di + dj*dj;
        callback(this.getCulture(i0 + di, j0 + dj), dist2);
      }
    }
  }
  this.getMostInfluent = function(pos, attribute) {
    var closestIDist = -1;
    var mostInfluent = null;
    this.forEachCulture(pos, function(culture, dist2) {
      if (culture[attribute]) {
        // This means even a culture with no influence will
        // win at dist = 0
        var iDist = dist2 / culture.influence;
        if ((iDist < closestIDist) || (closestIDist == -1)) {
          mostInfluent = culture[attribute];
        }
      }
    });
    return mostInfluent;
  }
  
  this.getNation = function(pos) {
    return this.getMostInfluent(pos, "nation");
    // If no nation, it'll be a city-state (nothing handles that yet)
  };
  this.getRace = function(pos) {
    return this.getMostInfluent(pos, "race");
  };

  DENIZENKINDS = [
    // "Mystical religious order",
    "School of magic",
    "Refugees from a great war",
    "A secret assassin",
    "The royal inquisitors",
    "Ambassadors from a nearby nation",
  ]
 var worshipKeyField = sField.simpleMap(119);

  this.getCityDenizens = function(pos) {
    // Who's up to what in a city?
    var factions = [];
    var key = worshipKeyField(pos.x, pos.y);
    this.forEachCulture(pos, function(culture, dist2) {
      // TODO: maybe sort/vary according to influence?
      if (culture.conspiracy) {
        //factions.push(culture.conspiracy);
      }
      else if (culture.worship) {
        // I could possibly allow one positive and up to two negative...
        var phrase = sRandomUtils.pick(sCultureFeatures.WORSHIP_DENIZENS, key);
        phrase = phrase.replace("[WORSHIPOBJECT]", culture.worship.object);
        factions.push(phrase);
        key = key * sCultureFeatures.WORSHIP_DENIZENS.length;
      }
    });
    return factions;
  }
})
.service("sFeatures",
 function(sField, sStringGen, sCultures, sCultureFeatures, sRandomUtils) {
  function makeFeature(featureId, getter) {
    var field = sField.simpleMap(featureId);
    return function(pos) {
      return getter(pos, field(pos.x, pos.y));
    }
  }
  
  // City Features
  this.CITYNAME = makeFeature(117, function(pos, key) {
    return sStringGen.townname(key);
  });

  this.CITYBASICNATION = makeFeature(123, function(pos, key) {
    return sCultures.getNation(pos);
  });

  this.CITYRULER = makeFeature(119, function(pos, key) {
    var nation = sCultures.getNation(pos);
    return sRandomUtils.pick(sCultureFeatures.NATIONRULERS[nation.kind], key);
  });
  
  this.CITYRACE = makeFeature(143, function(pos, key) {
    return sCultures.getRace(pos);
  });
  
  this.CITYBLURB = makeFeature(147, function(pos, key) {
    var nation = sCultures.getNation(pos);
    return sRandomUtils.pick(sCultureFeatures.NATIONCITIES[nation.kind], key);
  });

  this.CITYFEATURES = makeFeature(149, function(pos, key) {
    return sStringGen.fantasyregion(key).split("<li>");
  });

  var MAINOCCUPATIONS = ["nobles", "landowners", "soldiers", "scribes", 
    "merchants", "craftsmen", "fishermen", "slaves",
  ];

  this.CITYPOPULATION = makeFeature(153, function(pos, key) {
    // pick two, in order
    var occupations = sRandomUtils.pickTwoOrdered(MAINOCCUPATIONS, key);
    return occupations.join(" and ");
  });
  
  var STANDARDDENIZENS = [
    "Beggars, hanging around the market place",
    "Pilgrims, on their way to see a holy place",
    "Dancers, preparing for a holy festival",
    "Adventurers, looking for trouble",
    "Knights, training outside the gates",
    "Thieves, lurking in the shadows",
    "A storyteller, recalling old legends",
    "Mercenaries, on a secret mission",
  ]

  this.CITYDENIZENS = makeFeature(151, function(pos, key) {
    var factions = sCultures.getCityDenizens(pos);
    factions.unshift(sRandomUtils.pick(STANDARDDENIZENS, key));
    return factions;
  });
})
.service("sCities", function(sFeatures) {
  var knownCities = {};
  // Used for world map
  this.getBasic = function(world, pos) {
    return {
      nation: sFeatures.CITYBASICNATION(pos),
      name: sFeatures.CITYNAME(pos),
    };
  };
  // Used for detailed view, when selected
  this.getDetailed = function(world, pos) {
    var posv = [pos.x, pos.y];
    if (!knownCities[posv]) {
      knownCities[posv] = angular.extend({
        //race:     sFeatures.CITYRACE(pos),
        blurb:    sFeatures.CITYBLURB(pos),
        ruler:    sFeatures.CITYRULER(pos),
        features: sFeatures.CITYFEATURES(pos),
        population: sFeatures.CITYPOPULATION(pos),
        denizens: sFeatures.CITYDENIZENS(pos),
      }, this.getBasic(world, pos));
    }
    return knownCities[posv];
  };
});
