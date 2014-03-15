/// <reference path="imports.d.ts" />
export interface IOptions {
    path?: string;
    root?: string;
    cache?: boolean;
    content?: string;
}
export interface IOptionsExpress {
    settings: {
        etag: boolean;
        env: string;
        views: string;
    };
    _locals(): any;
    cache: boolean;
}
export declare function internalCompileString(content: string, options: IOptions): (params: any) => string;
export declare function express2Compile(templateString: string, options?: any): (params: any) => string;
/**
*
* @param filename
* @param options
* @param callback
*/
export declare function express3RenderFile(filename: string, options: any, callback: (err: Error, output?: string) => void): void;
/**
*
*/
export declare function renderFileSync(viewsPath: string, filename: string, parameters?: any, cache?: boolean): string;
export declare function renderFile(viewsPath: string, filename: string, parameters: any, cache: boolean, done: (err: Error, result?: string) => void): void;
export declare function registerExtension(items: any): void;
export declare function registerTags(items: any): void;
export declare function registerFunctions(items: any): void;
export declare function registerFilters(items: any): void;
export declare function registerTests(items: any): void;
export declare var compile: typeof express2Compile;
export declare var __express: typeof express3RenderFile;
