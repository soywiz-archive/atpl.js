function normalizePath(path) {
    var components = [];
    var notNormalizedComponents = path.split(/[\\\/]/g);
    path = path.replace(/\\/g, '/');
    for(var index in notNormalizedComponents) {
        var component = notNormalizedComponents[index];
        switch(component) {
            case '': {
                break;

            }
            case '.': {
                break;

            }
            case '..': {
                if(components.length > 0) {
                    components.pop();
                }
                break;

            }
            default: {
                components.push(component);
                break;

            }
        }
    }
    var retval = components.join('/');
    if(path.match(/^\//)) {
        retval = '/' + retval;
    }
    return retval;
}
exports.normalizePath = normalizePath;
function pathIsInside(basePath, path) {
    basePath = normalizePath(basePath) + '/';
    path = normalizePath(path) + '/';
    return (path.substr(0, basePath.length) == basePath);
}
exports.pathIsInside = pathIsInside;
function interpretNumber(number, radix) {
    number = String(number);
    if(number == '0') {
        return 0;
    }
    if(radix === undefined) {
        if(number.substr(0, 2).toLowerCase() == '0x') {
            return interpretNumber(number.substr(2), 16);
        }
        if(number.substr(0, 2).toLowerCase() == '0b') {
            return interpretNumber(number.substr(2), 2);
        }
        if(number.substr(0, 1) == '0') {
            return interpretNumber(number.substr(1), 8);
        }
        radix = 10;
    }
    if(radix == 10) {
        return parseFloat(number);
    }
    return parseInt(number, radix);
}
exports.interpretNumber = interpretNumber;
