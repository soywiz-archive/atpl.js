var AdvancedTpl = function() {
};

//AdvancedTpl

exports.compileAndExecuteString = function(content) {
	return content;
};

function templateTokenizer() {
}

exports.compile = function(content, info) {
	console.log("COMPILE:");
	console.log(arguments);
	return function() {
	console.log("RENDER:");
		console.log(arguments);
		//return 'Hello World!';
		return content;
	};
};