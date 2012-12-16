export class LanguageContext {
	tags:any = {};
	functions:any = {};
	filters:any = {};
	tests:any = {};

	private _registerSomething(object: any, list: any) {
		for (var key in list) {
			object[key.replace(/^\$+/, '')] = list[key];
		}
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