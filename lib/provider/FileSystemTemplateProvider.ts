import fs = require('fs');
import util = require('util');
import RuntimeUtils = require('../runtime/RuntimeUtils');
import ITemplateProvider = require('./ITemplateProvider');

class FileSystemTemplateProvider implements ITemplateProvider {
    basePath;
    basePathComponents;
    cacheObject: any = {};

    constructor(basePath: string) {
        this.basePath = RuntimeUtils.normalizePath(basePath);
        this.basePathComponents = this.basePath.split('/');
        //console.log(this.basePath);
        //process.exit(0);
    }

    getSync(path: string, cache: boolean): string {
        if (!cache) delete this.cacheObject[path];

        //console.log(path);

        if (this.cacheObject[path] === undefined) {
            var normalizedPath = RuntimeUtils.normalizePath(this.basePath + '/' + path);

            if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
                throw (new Error("Outside the Base Path"));
            }

            this.cacheObject[path] = (<string><any>fs.readFileSync(normalizedPath, 'utf-8')).replace(/^\uFEFF/, '');
        }
        return this.cacheObject[path];
    }
}

export = FileSystemTemplateProvider;
