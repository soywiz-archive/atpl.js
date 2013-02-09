///<reference path='imports.d.ts'/>

import fs    = module('fs');
import util  = module('util');
import utils = module('./utils');

export interface TemplateProvider {
	getSync(path: string, cached: bool): string;
}

export class FileSystemTemplateProvider implements TemplateProvider {
	basePath;
	basePathComponents;
	cacheObject: any = {};

	constructor(basePath: string) {
		this.basePath = utils.normalizePath(basePath);
		this.basePathComponents = this.basePath.split('/');
		//console.log(this.basePath);
		//process.exit(0);
	}

	getSync(path: string, cache: bool): string {
		if (!cache) delete this.cacheObject[path];

		//console.log(path);

		if (this.cacheObject[path] === undefined) {
			var normalizedPath = utils.normalizePath(this.basePath + '/' + path);

			if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
				throw (new Error("Outside the Base Path"));
			}

			this.cacheObject[path] = fs.readFileSync(normalizedPath, 'utf-8').replace(/^\uFEFF/, '');
		}
		return this.cacheObject[path];
	}
}

export class MemoryTemplateProvider implements TemplateProvider {
	registry: any = {};
	registryCached: any = {};

	constructor() {
	}

	add(path: string, data: string) {
		this.registry[path] = data;
	}

	getSync(path: string, cache: bool): string {
		if (!cache) delete this.registryCached[path];
		if (this.registryCached[path] === undefined) this.registryCached[path] = this.registry[path];
		var data = this.registryCached[path];
		if (data === undefined) throw(new Error("Can't find key '" + path + "'"));
		return data;
	}
}
