///<reference path='imports.d.ts'/>

export class TemplateConfig
{
	constructor(public cache: boolean = true) {
	}

	setCacheTemporal(value: boolean, callback: () => void): any {
		var oldValue = this.cache;
		this.cache = value;
		try {
			return callback();
		} finally {
			this.cache = oldValue;
		}
	}

	getCache() {
		return this.cache;
	}
}
