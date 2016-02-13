export interface ITemplateProvider {
    getSync(path: string, cached: boolean): string;
}
