var helpers = {
	eq:  function(a, b) { return a == b; },
	ne:  function(a, b) { return a != b; },
	gt:  function(a, b) { return a > b;  },
	gte: function(a, b) { return a >= b; },
	lt:  function(a, b) { return a < b;  },
	lte: function(a, b) { return a <= b; },
	mod: function(a, b) { return a % b; },

	block: function(name){
		var blocks = this._blocks;
			content = blocks && blocks[name];
		return content ? content.join('\n') : null;
	},
	contentFor: function(name, options){
		var blocks = this._blocks || (this._blocks = {});
			block = blocks[name] || (blocks[name] = []);
		block.push(options.fn(this));
	}
}

for (var name in helpers) {
	exports[name] = helpers[name];
}