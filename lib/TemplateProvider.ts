///<reference path='imports.d.ts'/>

import fs    = module('fs');
import util  = module('util');
import utils = module('./utils');

export interface TemplateProvider {
	getSync(path);
}

export class FileSystemTemplateProvider implements TemplateProvider {
	basePath;
	basePathComponents;
	cacheObject: any = {};

	constructor(basePath: string, public cache: bool = true) {
		this.basePath = utils.normalizePath(basePath);
		this.basePathComponents = this.basePath.split('/');
	}

	getSync(path: string) {
		if (this.cacheObject[path] === undefined) {
			var normalizedPath = utils.normalizePath(this.basePath + '/' + path);

			if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
				throw (new Error("Outside the Base Path"));
			}

			this.cacheObject[path] = fs.readFileSync(normalizedPath, 'utf-8');
		}
		return this.cacheObject[path];
	}
}

export class MemoryTemplateProvider implements TemplateProvider {
	registry: any = {};

	constructor() {
	}

	add(path: string, data: string) {
		this.registry[path] = data;
	}

	getSync(path: string) {
		var data = this.registry[path];
		if (data === undefined) throw(new Error("Can't find key '" + path + "'"));
		return data;
	}
}
