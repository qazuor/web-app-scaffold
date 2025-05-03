import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import type { PackagesManager } from '../core/PackagesManager.js';
import type { FrameworkOptions } from '../types/framework.js';
import type {
    PackageDependency,
    PackageEnvVar,
    PackageOptions,
    PackageScript,
    ScopeFrom,
    ScriptsObject
} from '../types/index.js';

export const getDataFromPackageJsonContent = (
    packageJsonContent: PackageJson,
    scope: 'dependencies' | 'devDependencies' | 'scripts' = 'dependencies'
): (PackageDependency | PackageScript)[] => {
    const data: (PackageDependency | PackageScript)[] = [];
    const packageJsonData = packageJsonContent[scope];
    if (packageJsonData) {
        for (const entry of Object.entries(packageJsonData)) {
            if (scope === 'dependencies' || scope === 'devDependencies') {
                data.push({ name: entry[0], version: entry[1] as string });
            } else if (scope === 'scripts') {
                data.push({ name: entry[0], command: entry[1] as string });
            }
        }
    }
    return data;
};

export const loadDependencies = async (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager,
    templatePath: string,
    name: string,
    options: PackageOptions | FrameworkOptions,
    executables: ScriptsObject,
    scope: 'app' | 'package' = 'app',
    isDev = false
): Promise<PackageDependency[]> => {
    const dependencies: PackageDependency[] = [];

    // dependencies from the config.json
    const dependenciesFromConfigJson: PackageDependency[] =
        options[isDev ? 'devDependencies' : 'dependencies'] || [];
    for (const dependency of dependenciesFromConfigJson) {
        dependency.from = { scope: scope, type: 'config' } as ScopeFrom;
        dependencies.push(dependency);
    }

    // dependencies from executable file
    const executableFile = executables.dependencies;
    if (executableFile) {
        const executableFileClass = await import(
            path.join(templatePath, name, 'scripts', executableFile)
        );
        const dependenciesFromExecutableFiles = await executableFileClass[
            isDev ? 'getDevDependencies' : 'getDependencies'
        ](configsManager, frameworksManager, packagesManager);
        for (const dependency of dependenciesFromExecutableFiles) {
            dependency.from = { scope: scope, type: 'executable' } as ScopeFrom;
            dependencies.push(dependency);
        }
    }

    return dependencies;
};

export const loadScripts = async (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager,
    templatePath: string,
    name: string,
    options: PackageOptions | FrameworkOptions,
    executables: ScriptsObject,
    scope: 'app' | 'package' = 'app'
): Promise<PackageScript[]> => {
    const scripts: PackageScript[] = [];

    // scripts from the config.json
    const scriptsFromConfigJson: PackageScript[] = options.scripts || [];
    for (const script of scriptsFromConfigJson) {
        script.from = { scope: scope, type: 'config' } as ScopeFrom;
        scripts.push(script);
    }

    // scripts from executable file
    const executableFile = executables.scripts;
    if (executableFile) {
        const executableFileClass = await import(
            path.join(templatePath, name, 'scripts', executableFile)
        );
        const scriptsFromExecutableFiles = await executableFileClass.getScripts(
            configsManager,
            frameworksManager,
            packagesManager
        );
        for (const script of scriptsFromExecutableFiles) {
            script.from = { scope: scope, type: 'executable' } as ScopeFrom;
            scripts.push(script);
        }
    }

    return scripts;
};

export const loadEnvVars = async (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager,
    templatePath: string,
    name: string,
    options: PackageOptions | FrameworkOptions,
    executables: ScriptsObject,
    scope: 'app' | 'package' = 'app'
): Promise<PackageEnvVar[]> => {
    const envVars: PackageEnvVar[] = [];

    // env vars from the config.json
    const envVarsFromConfigJson: PackageEnvVar[] = options.envVars || [];
    for (const envVar of envVarsFromConfigJson) {
        envVar.from = { scope: scope, type: 'config' } as ScopeFrom;
        envVars.push(envVar);
    }

    // env vars from executable file
    const executableFile = executables.envVars;
    if (executableFile) {
        const executableFileClass = await import(
            path.join(templatePath, name, 'scripts', executableFile)
        );
        const envVarsFromExecutableFiles = await executableFileClass.getVars(
            configsManager,
            frameworksManager,
            packagesManager
        );
        for (const envVar of envVarsFromExecutableFiles) {
            envVar.from = { scope: scope, type: 'executable' } as ScopeFrom;
            envVars.push(envVar);
        }
    }

    return envVars;
};
