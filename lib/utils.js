(function() {
	'use strict';

	exports.normalizePath = function(path) {
		var components = [];
		var notNormalizedComponents = path.split('/');
		path = path.replace('\\', '/');
		for (var index in notNormalizedComponents) {
			var component = notNormalizedComponents[index];
			switch (component) {
				case '':
				break;
				case '.':
				break;
				case '..':
					if (components.length > 0) components.pop();
				break;
				default:
					components.push(component);
				break;
			}
		}
		var retval = components.join('/');
		if (path.match(/^\//)) {
			retval = '/' + retval;
		}
		return retval;
	};
	
	exports.pathIsInside = function(basePath, path) {
		basePath = exports.normalizePath(basePath) + '/';
		path     = exports.normalizePath(path) + '/';

		return (path.substr(0, basePath.length) == basePath);
	};
})();