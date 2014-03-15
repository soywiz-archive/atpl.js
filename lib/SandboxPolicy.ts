class SandboxPolicy
{
    allowedTags: string[] = ['for', 'endfor', 'if', 'endif', 'include', 'sandbox', 'endsandbox'];
    allowedFunctions: string[] = [];
    allowedFilters: string[] = ['upper', 'default'];

    constructor() {
    }
}

export = SandboxPolicy;