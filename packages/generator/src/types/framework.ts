import type { PackageDependency, PackageEnvVar, PackageScript } from './index.js';

/**
 * Configuration for a frameowrk in the generator
 */
export interface FrameworkConfig {
    /** Frameowrk name */
    name: string;
    /** Display name for the framework in the selection prompt */
    displayName: string;
    /** Short description of the framework */
    description: string;
    /** Default name for the app if none is provided */
    defaultAppName: string;
    /** Default description for the app if none is provided */
    defaultAppDescription: string;
    /** Dependencies that should be installed with this framework */
    dependencies?: PackageDependency[];
    /** Dev dependencies that should be installed with this framework */
    devDependencies?: PackageDependency[];
    /** Script that should be added to app package.json */
    scripts?: PackageScript[];
    /** Env vars that should be added to app package.json */
    envVars?: PackageEnvVar[];
    /** Whether this framework has UI (for use UI or Icon Libraries) */
    hasUI?: boolean;
    /** Whether to add Biome config */
    addBiomeConfig?: boolean;
    /** Testing related dependencies */
    testingDependencies?: PackageDependency[];
    /** Testing related scripts */
    testingScripts?: PackageScript[];
}

/**
 * Configuration for selected framework in the generator
 */
export interface FrameworkOptions extends FrameworkConfig {
    /** selectedPackages */
    selectedPackages?: string[];
    /** Name for the shared package */
    sharedPackageName?: string;
}

/**
 * Context for framework templates files
 */
export interface FrameworkTemplateContext {
    /** selectedPackages */
    selectedPackages?: string[];
    /** Name for the shared package */
    sharedPackageName?: string;
}
