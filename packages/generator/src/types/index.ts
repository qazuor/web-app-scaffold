export type Dependency = {
    name: string;
    version: string;
};

export type Script = {
    name: string;
    command: string;
};

export type DependencyScope = {
    installInShared?: boolean;
    installInApp?: boolean;
};

export type ScriptScope = {
    addInShared?: boolean;
    addInApp?: boolean;
};

export type PackageDependency = Dependency & {
    installInShared?: boolean;
    installInApp?: boolean;
};

export type PackageScript = Script & ScriptScope;

export interface PromptChoice {
    name: string;
    value: string;
}

export interface ExtraOptionPrompt {
    type: 'input' | 'confirm' | 'list' | 'checkbox';
    message: string;
    choices?: PromptChoice[];
    default?: string | boolean | string[] | number | number[];
}

export * from './generator.js';
export * from './metadata.js';
export * from './package.js';
