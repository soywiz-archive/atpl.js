import { ITemplateProvider } from './ITemplateProvider';
import fs = require('fs');
import RuntimeUtils = require('../runtime/RuntimeUtils');

export class FileSystemTemplateProvider implements ITemplateProvider {
    basePath: string;
    basePathComponents: string[];
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
            var normalizedPath = RuntimeUtils.normalizePath(path);
            if (normalizedPath.indexOf(this.basePath) === -1) {
              normalizedPath = this.basePath + '/' + normalizedPath;
            }
            if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
                throw (new Error("Outside the Base Path"));
            }
            this.cacheObject[path] = normalizedPath;
            // this.cacheObject[path] = (<string><any>fs.readFileSync(normalizedPath, 'utf-8')).replace(/^\uFEFF/, '');
        }
        return this.cacheObject[path];
    }
}
