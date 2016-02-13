import RuntimeUtils = require('../runtime/RuntimeUtils');

export class DefaultTests {
	// http://twig.sensiolabs.org/doc/tests/constant.html
	static constant(value: string, constant: string) {
		throw (new Error("Not implemented test [constant] [no use on javascript]"));
	}

	// http://twig.sensiolabs.org/doc/tests/defined.html
	static defined(value: any) {
		return RuntimeUtils.defined(value);
	}

	// http://twig.sensiolabs.org/doc/tests/divisibleby.html
	static divisibleby(value: any, right: any) {
		return (value % right) == 0;
	}

	// http://twig.sensiolabs.org/doc/tests/empty.html
	static empty(value: any) {
		return RuntimeUtils.empty(value);
	}

	// http://twig.sensiolabs.org/doc/tests/even.html
	static even(value: any) {
		return (value % 2) == 0;
	}

	// http://twig.sensiolabs.org/doc/tests/iterable.html
	static iterable(value: any) {
		if (RuntimeUtils.isArray(value)) return true;
		if (RuntimeUtils.isObject(value) && (value !== null)) return true;
		return false;
	}

	// http://twig.sensiolabs.org/doc/tests/null.html
	static $null(value: any) {
		return (value === null);
	}

	// http://twig.sensiolabs.org/doc/tests/odd.html
	static odd(value: any) {
		return (value % 2) == 1;
	}

	// http://twig.sensiolabs.org/doc/tests/sameas.html
	static sameas(value: any, right: any) {
		return (value === right);
	}
}
