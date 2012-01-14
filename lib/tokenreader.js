(function() {
	'use strict';

	var TokenReader = exports.TokenReader = function(tokens) {
		this.tokens   = tokens;
		this.position = 0;
	};

	TokenReader.prototype.hasMore = function() {
		return this.getLeftCount() > 0;
	};

	TokenReader.prototype.getLeftCount = function() {
		return this.tokens.length - this.position;
	};

	TokenReader.prototype.peek = function() {
		return this.tokens[this.position];
	};

	TokenReader.prototype.read = function() {
		var item = this.peek();
		this.position++;
		return item;
	};
})();