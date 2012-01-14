var fs = require('fs');
var util = require('util');
var utils = require('./utils.js');

(function() {
	'use strict';

	var TemplateProvider = exports.TemplateProvider = function() {
	};
	
	TemplateProvider.prototype.get = function(path, callback) {
		throw(new Error("Not implemented TemplateProvider.get"));
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

		FileSystemTemplateProvider.prototype.get = function(path, callback) {
			var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
			
			if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
				throw(new Error("Outside the Base Path"));
			}
			
			fs.readFile(normalizedPath, 'utf-8', function (err, data) {
				if (err) throw err;
				callback(data);
			});
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

		MemoryTemplateProvider.prototype.get = function(path, callback) {
			var data = this.registry[path];
			if (data === undefined) throw(new Error("Can't find key '" + path + "'"));
			callback(data);
		};
	})();
})();