var SandboxPolicy = (function () {
    function SandboxPolicy() {
        this.allowedTags = [
            'for', 
            'endfor', 
            'if', 
            'endif', 
            'include', 
            'sandbox', 
            'endsandbox'
        ];
        this.allowedFunctions = [];
        this.allowedFilters = [
            'upper', 
            'empty'
        ];
    }
    return SandboxPolicy;
})();
exports.SandboxPolicy = SandboxPolicy;
