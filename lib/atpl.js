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
	console.log(info);
	return function(info) {
		console.log("RENDER:");
		console.log(info);
		//return 'Hello World!';
		return content;
	};
};