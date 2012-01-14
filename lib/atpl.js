var TemplateParser = require('./parser/TemplateParser.js').TemplateParser;
var FileSystemTemplateProvider = require('./TemplateProvider.js').FileSystemTemplateProvider;

var AdvancedTpl = function() {
};

//AdvancedTpl

exports.compileAndExecuteString = function(content) {
	return content;
};

function templateTokenizer() {
}

var registryTemplateParser = {};

exports.compile = function(content, info) {
	if (registryTemplateParser[info.root] === undefined) {
		var templateProvider = new FileSystemTemplateProvider(info.root);
		registryTemplateParser[info.root] = new TemplateParser(templateProvider);
	}
	var templateParser = registryTemplateParser[info.root];
	
	//console.log("COMPILE:");
	//console.log(info);
	return function(info) {
		var output = templateParser.compileAndRenderToString(info.filename.substr(info.root.length), info);
		return output;
		
		/*
		console.log("RENDER:");
		console.log(info);
		//return 'Hello World!';
		return content;
		*/
	};
};