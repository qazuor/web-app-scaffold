import type { Package } from '../entity/Package.js';
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
    /** Add Biome configs and scripts? */
    addBiome?: boolean;
    /** Add testing configs and files? */
    addTesting?: boolean;
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
 * App Context vars for framework templates files
 */
export interface AppTemplateContextVars {
    /** Selected App name */
    name: string;
    /** Selected App description */
    description: string;
    /** Selected App port */
    port: number;
    /** Selected App author */
    author: string;
    /** Selected App license */
    license: string;
    /** Selected App homepage */
    homepage: string;
    /** Selected App repo url */
    repoUrl: string;
    /** Selected App bugs url */
    bugsUrl: string;
    /** Selected App author email */
    bugsEmail: string;
}

/**
 * Framework Context vars for framework templates files
 */
export interface FrameworkTemplateContextVars {
    /** Framework name */
    name: string;
    /** Framework display name */
    displayName: string;
    /** Framework description */
    description: string;
    /** Framework has ui */
    hasUI: boolean;
    /** Framework add biome for lint and format */
    addBiome: boolean;
    /** Framework add testing */
    addTesting: boolean;
}

/**
 * Dependencies Context vars for framework templates files
 */
export interface DependenciesTemplateContextVars {
    configAppDependencies: PackageDependency[];
    configAppDevDependencies: PackageDependency[];
    dynamicAppDependencies: PackageDependency[];
    dynamicAppDevDependencies: PackageDependency[];
    testingAppDevDependencies: PackageDependency[];

    configPackagesDependencies: PackageDependency[];
    configPackagesDevDependencies: PackageDependency[];
    dynamicPackagesDependencies: PackageDependency[];
    dynamicPackagesDevDependencies: PackageDependency[];
}

/**
 * Scripts Context vars for framework templates files
 */
export interface ScriptsTemplateContextVars {
    configAppScripts: PackageScript[];
    dynamicAppScripts: PackageScript[];
    configPackagesScripts: PackageScript[];
    dynamicPackagesScripts: PackageScript[];
}

/**
 * Env vars Context vars for framework templates files
 */
export interface AppEnvVarsTemplateContextVars {
    configAppEnvVars: PackageEnvVar[];
    dynamicAppEnvVars: PackageEnvVar[];
    configPackagesEnvVars: PackageEnvVar[];
    dynamicPackagesEnvVars: PackageEnvVar[];
}

/**
 * Selected packages Context vars for framework templates files
 */
export interface SelectedPackagesTemplateContextVars {
    additionalPackages: Package[];
}

/**
 * Context for framework templates files
 */
export interface FrameworkTemplateContext {
    app: AppTemplateContextVars;
    framework: FrameworkTemplateContextVars;
    dependencies: DependenciesTemplateContextVars;
    scripts: ScriptsTemplateContextVars;
    envVars: AppEnvVarsTemplateContextVars;
    selectedPackages: SelectedPackagesTemplateContextVars;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    contextVars: Record<string, any>;
}
