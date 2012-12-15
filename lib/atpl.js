var TemplateParser = require('./parser/TemplateParser')
var TemplateProvider = require('./TemplateProvider')
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;
var AdvancedTpl = function () {
};
function compileAndExecuteString(content) {
    return content;
}
exports.compileAndExecuteString = compileAndExecuteString;
function templateTokenizer() {
}
var registryTemplateParser = {
};
function compile(content, info) {
    if(registryTemplateParser[info.root] === undefined) {
        var templateProvider = new FileSystemTemplateProvider(info.root);
        registryTemplateParser[info.root] = new TemplateParser.TemplateParser(templateProvider);
    }
    var templateParser = registryTemplateParser[info.root];
    return function (info) {
        var output = templateParser.compileAndRenderToString(info.filename.substr(info.root.length), info);
        return output;
    }
}
exports.compile = compile;
; ;
