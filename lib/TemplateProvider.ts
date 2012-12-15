///<reference path='imports.d.ts'/>

import fs    = module('fs');
import util  = module('util');
import utils = module('./utils');

export interface TemplateProvider {
	getAsync(path, callback);
	getSync(path);
}

export class FileSystemTemplateProvider implements TemplateProvider {
	basePath;
	basePathComponents;
	cache;
	registry;

	constructor(basePath, cache?) {
		if (cache === undefined) cache = true;
		this.basePath = utils.normalizePath(basePath);
		this.basePathComponents = this.basePath.split('/');
		
		// Cache not implemented.
		this.cache = cache;
		this.registry = {};
	}

	getAsync(path, callback) {
		var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
		
		if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
			throw(new Error("Outside the Base Path"));
		}
		
		fs.readFile(normalizedPath, 'utf-8', function (err, data) {
			if (err) throw err;
			callback(data);
		});
	}

	getSync(path) {
		var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
		
		if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
			throw(new Error("Outside the Base Path"));
		}
		
		return fs.readFileSync(normalizedPath, 'utf-8');
	}
}

export class MemoryTemplateProvider implements TemplateProvider {
	registry;

	constructor() {
		this.registry = {};
	}

	add(path, data) {
		this.registry[path] = data;
	};

	getAsync(path, callback) {
		callback(this.getSync(path));
	};

	getSync(path) {
		var data = this.registry[path];
		if (data === undefined) throw(new Error("Can't find key '" + path + "'"));
		return data;
	};
}
