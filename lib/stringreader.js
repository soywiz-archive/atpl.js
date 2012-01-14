(function() {
	'use strict';

	var StringReader = exports.StringReader = function(string) {
		this.string   = string;
		this.position = 0;
	};

	StringReader.prototype.hasMore = function() {
		return this.getLeftCount() > 0;
	};

	StringReader.prototype.getLeftCount = function() {
		return this.string.length - this.position;
	};

	StringReader.prototype.skipChars = function(count) {
		this.position += count;
	};
	
	StringReader.prototype.readLeft = function() {
		return this.readChars(this.getLeftCount());
	};

	StringReader.prototype.peakChars = function(count) {
		return this.string.substr(this.position, count);
	};

	StringReader.prototype.readChars = function(count) {
		var str = this.peakChars(count);
		this.position += count;
		return str;
	};

	StringReader.prototype.readChar = function() {
		/*
		var char = this.string.charAt(this.position);
		this.position++;
		return char;
		*/
		return this.readChars(1);
	};

	StringReader.prototype.findRegexp = function(regexp) {
		var match = this.string.substr(this.position).match(regexp);
		if (match === null) {
			return {
				position : null,
				length   : null,
			}
		} else {
			return {
				position : match.index,
				length   : match[0].length,
			}
		}
	};
})();