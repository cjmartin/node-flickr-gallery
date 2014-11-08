var helpers = {
	eq:  function(a, b) { return a == b; },
	ne:  function(a, b) { return a != b; },
	gt:  function(a, b) { return a > b;  },
	gte: function(a, b) { return a >= b; },
	lt:  function(a, b) { return a < b;  },
	lte: function(a, b) { return a <= b; },
	mod: function(a, b) { return a % b; },
}

for (var name in helpers) {
	exports[name] = helpers[name];
}