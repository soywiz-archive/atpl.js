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
	
	var FileSystemTemplateProvider = exports.FileSystemTemplateProvider = function(basePath) {
		this.basePath = utils.normalizePath(basePath);
		this.basePathComponents = this.basePath.split('/');
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