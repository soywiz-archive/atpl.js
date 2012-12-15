///<reference path='imports.d.ts'/>

export import TemplateParser = module('./parser/TemplateParser');
import TemplateProvider = module('./TemplateProvider');
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;

var AdvancedTpl = function() {
};

//AdvancedTpl

export function compileAndExecuteString(content) {
	return content;
}

function templateTokenizer() {
}

var registryTemplateParser = {};

export function compile(content: string, info: any) {
	if (registryTemplateParser[info.root] === undefined) {
		var templateProvider = new FileSystemTemplateProvider(info.root);
		registryTemplateParser[info.root] = new TemplateParser.TemplateParser(templateProvider);
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