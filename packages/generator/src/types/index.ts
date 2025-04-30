export type Dependency = {
    name: string;
    version: string;
};

export type Script = {
    name: string;
    command: string;
};

export type EnvVars = {
    name: string;
    value: string | number | boolean;
};

export type ScopeFrom =
    | 'config'
    | 'template'
    | 'executable'
    | 'config-package'
    | 'template-package'
    | 'executable-package';

export type DependencyScope = {
    addInShared?: boolean;
    addInApp?: boolean;
    from?: ScopeFrom;
};

export type ScriptScope = {
    addInShared?: boolean;
    addInApp?: boolean;
    from?: ScopeFrom;
};

export type EnvVarsScope = {
    addInShared?: boolean;
    addInApp?: boolean;
    from?: ScopeFrom;
};

export type PackageDependency = Dependency & DependencyScope;

export type PackageScript = Script & ScriptScope;

export type PackageEnvVar = EnvVars & EnvVarsScope;

export interface PromptChoice {
    name: string;
    value: string;
}

export interface ExtraOptionPrompt {
    type: 'input' | 'confirm' | 'list' | 'checkbox';
    name: string;
    message: string;
    choices?: PromptChoice[];
    default?: string | boolean | string[] | number | number[];
}

export interface ScriptsObject {
    preInstall?: string;
    postInstall?: string;
    templateContextVars?: string;
    dependencies?: string;
    scripts?: string;
    envVars?: string;
}

export * from './generator.js';
export * from './metadata.js';
export * from './package.js';
