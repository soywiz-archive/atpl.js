import TemplateConfig = module('./TemplateConfig');

export class LanguageContext {
	tags:any = {};
	functions:any = {};
	filters:any = {};
	tests:any = {};

	constructor (public templateConfig: TemplateConfig.TemplateConfig = undefined) {
		if (this.templateConfig === undefined) this.templateConfig = new TemplateConfig.TemplateConfig(true);
	}

	private _registerSomethingItem(object: any, key: string, value: any) {
		object[key.replace(/^\$+/, '')] = value;
	}

	private _registerSomething(object: any, list: any) {
		if (list !== undefined) {
			for (var key in list) this._registerSomethingItem(object, key, list[key]);
		}
	}

	registerExtension(container: any) {
		this.registerTags(container.tags);
		this.registerFunctions(container.functions);
		this.registerFilters(container.filters);
		this.registerTests(container.tests);
	}

	registerTags(tags: any) {
		this._registerSomething(this.tags, tags);
	}

	registerFunctions(functions: any) {
		this._registerSomething(this.functions, functions);
	}

	registerFilters(filters: any) {
		this._registerSomething(this.filters, filters);
	}

	registerTests(tests: any) {
		this._registerSomething(this.tests, tests);
	}
}
