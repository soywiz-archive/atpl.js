var fs    = require('fs');
var util  = require('util');
var utils = require('./Utils.js');

var TemplateProvider = exports.TemplateProvider = function() {
};

TemplateProvider.prototype.getAsync = function(path, callback) {
	throw(new Error("Not implemented TemplateProvider.getAsync"));
};

TemplateProvider.prototype.getSync = function(path) {
	throw(new Error("Not implemented TemplateProvider.getSync"));
};

(function() {
	var FileSystemTemplateProvider = exports.FileSystemTemplateProvider = function(basePath, cache) {
		if (cache === undefined) cache = true;
		this.basePath = utils.normalizePath(basePath);
		this.basePathComponents = this.basePath.split('/');
		
		// Cache not implemented.
		this.cache = cache;
		this.registry = {};
	};
	
	util.inherits(FileSystemTemplateProvider, TemplateProvider);

	FileSystemTemplateProvider.prototype.getAsync = function(path, callback) {
		var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
		
		if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
			throw(new Error("Outside the Base Path"));
		}
		
		fs.readFile(normalizedPath, 'utf-8', function (err, data) {
			if (err) throw err;
			callback(data);
		});
	};

	FileSystemTemplateProvider.prototype.getSync = function(path, callback) {
		var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
		
		if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
			throw(new Error("Outside the Base Path"));
		}
		
		return fs.readFileSync(normalizedPath, 'utf-8');
	};
})();

(function() {
	var MemoryTemplateProvider = exports.MemoryTemplateProvider = function() {
		this.registry = {};
	};
	
	util.inherits(MemoryTemplateProvider, TemplateProvider);

	MemoryTemplateProvider.prototype.add = function(path, data) {
		this.registry[path] = data;
	};

	MemoryTemplateProvider.prototype.getAsync = function(path, callback) {
		callback(this.getSync(path));
	};

	MemoryTemplateProvider.prototype.getSync = function(path) {
		var data = this.registry[path];
		if (data === undefined) throw(new Error("Can't find key '" + path + "'"));
		return data;
	};
})();
