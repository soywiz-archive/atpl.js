var RuntimeContext = function() {
	this.output = '';
	this.scope = {};
};

RuntimeContext.prototype.createScope = function(callback) {
	var newScope = {};
	var oldScope = this.scope;
	newScope.__proto__ = oldScope;
	this.scope = newScope;
	try {
		callback();
	} finally {
		this.scope = oldScope;
	}
};

RuntimeContext.prototype.write = function(text) {
	if (text === undefined) return;
	if (text === null) return;
	this.output += text;
};

exports.RuntimeContext = RuntimeContext;