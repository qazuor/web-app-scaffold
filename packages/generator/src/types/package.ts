import type {
    ExtraOptionPrompt,
    PackageDependency,
    PackageEnvVar,
    PackageScript
} from './index.js';

/**
 * Configuration for a package in the generator
 */
export interface PackageConfig {
    /** Package name as it appears in package.json */
    name: string;
    /** Display name for the package in the selection prompt */
    displayName: string;
    /** Short description of the package */
    description: string;
    /** Version of the package to install */
    version: string;
    /** Frameworks this package is compatible with */
    supportedFrameworks?: string[];
    /** Whether this is a dev dependency */
    isDev?: boolean;
    /** Dependencies that should be installed with this package */
    dependencies?: PackageDependency[];
    /** Dev dependencies that should be installed with this package */
    devDependencies?: PackageDependency[];
    /** Script that should be added to app package.json */
    scripts?: PackageScript[];
    /** Env vars that should be added to app/shared package */
    envVars?: PackageEnvVar[];
    /** Whether this package is a UI library */
    isUILibrary?: boolean;
    /** Whether this package is an icon library */
    isIconLibrary?: boolean;
    /** Whether this package can be installed as a shared package */
    canBeSharedPackage?: boolean;
    /** Default name for the shared package */
    sharedPackageDefaultName?: string;
    /** Default description for the shared package */
    sharedPackageDefaultDescription?: string;
    /** Prompts configs for additional options for this package */
    extraOptionsPrompts?: ExtraOptionPrompt[];
}

export interface PackageOptions extends PackageConfig {
    /** Name for the shared package */
    sharedPackageName?: string;
    /** Selected configuration option */
    selectedConfig?: string;
    /** Installation type configuration */
    installationInfo?: PackageInstallationInfo;
}

export type PackageInstallationType = 'shared' | 'direct';

export type SharedPackagesInfo = {
    isShared: boolean;
    packageName?: string;
    packageDescription?: string;
};

/**
 * Installation type for a package
 */
export interface PackageInstallationInfo {
    /** Whether the package should be installed as a shared package */
    isShared: boolean;
    /** Name of the shared package if isShared is true */
    packageName?: string;
    /** Name of the shared package if isShared is true */
    packageDescription?: string;
}

/**
 * Context for package templates files
 */
export interface PackageTemplateContext {
    /** selectedPackages */
    selectedPackages?: string[];
    /** Name for the shared package */
    sharedPackageName?: string;
}

// /**
//  * Result of package installation
//  */
// export interface PackageInstallResult {
//     /** Whether installation was successful */
//     success: boolean;
//     /** Installation details */
//     details?: {
//         /** Number of packages installed */
//         packagesInstalled: number;
//         /** Number of files generated */
//         filesGenerated: number;
//         /** Number of scripts added */
//         scriptsAdded: number;
//     };
//     /** Error message if installation failed */
//     error?: string;
// }

// /**
//  * Configuration options for a package
//  */
// export interface PackageConfigOptions {
//     /** Prompt configuration */
//     prompt?: PackagePromptConfig;
//     /** Result configuration based on prompt selection */
//     resultForPrompt?: Record<string, PackageConfigResult>;
//     /** Default result configuration */
//     result?: PackageConfigResult;
// }

// /**
//  * Prompt configuration for package options
//  */
// export interface PackagePromptConfig {
//     /** Type of prompt to display */
//     type: 'list' | 'checkbox' | 'input';
//     /** Message to display in the prompt */
//     message: string;
//     /** Choices for list/checkbox prompts */
//     choices: Array<{
//         name: string;
//         value: string;
//     }>;
//     /** Default value */
//     default?: string;
// }

// /**
//  * Result configuration for package options
//  */
// export interface PackageConfigResult {
//     /** Dependencies to add */
//     dependencies?: string[];
//     /** Dev dependencies to add */
//     devDependencies?: string[];
//     /** Scripts to add to package.json */
//     scripts?: Record<string, string>;
//     /** Context variables for package templates */
//     contextPackageVars?: Record<string, Record<string, string>>;
// }
