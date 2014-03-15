interface ITemplateProvider {
    getSync(path: string, cached: boolean): string;
}
export = ITemplateProvider;