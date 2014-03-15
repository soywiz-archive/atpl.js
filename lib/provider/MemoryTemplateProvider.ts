import fs = require('fs');
import util = require('util');
import RuntimeUtils = require('../runtime/RuntimeUtils');
import ITemplateProvider = require('./ITemplateProvider');

class MemoryTemplateProvider implements ITemplateProvider {
    registry: any = {};
    registryCached: any = {};

    constructor() {
    }

    add(path: string, data: string) {
        this.registry[path] = data;
    }

    getSync(path: string, cache: boolean): string {
        if (!cache) delete this.registryCached[path];
        if (this.registryCached[path] === undefined) this.registryCached[path] = this.registry[path];
        var data = this.registryCached[path];
        if (data === undefined) throw (new Error("Can't find key '" + path + "'"));
        return data;
    }
}

export = MemoryTemplateProvider;