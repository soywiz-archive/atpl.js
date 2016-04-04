"use strict";
var SandboxPolicy = (function () {
    function SandboxPolicy() {
        this.allowedTags = ['for', 'endfor', 'if', 'endif', 'include', 'sandbox', 'endsandbox'];
        this.allowedFunctions = [];
        this.allowedFilters = ['upper', 'default'];
    }
    return SandboxPolicy;
}());
exports.SandboxPolicy = SandboxPolicy;
