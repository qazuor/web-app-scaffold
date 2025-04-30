import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import type { PackagesManager } from '../core/PackagesManager.js';
import type { TemplateManager } from '../core/TemplateManager.js';
import type {
    PackageDependency,
    PackageEnvVar,
    PackageOptions,
    PackageScript,
    ScopeFrom,
    ScriptsObject
} from '../types/index.js';
import { fileExist } from './file-operations.js';

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
    templateManager: TemplateManager,
    templatePath: string,
    name: string,
    options: PackageOptions,
    executables: ScriptsObject,
    isDev = false
): Promise<PackageDependency[]> => {
    const dependencies: PackageDependency[] = [];

    // dependencies from the config.json
    const dependenciesFromConfigJson: PackageDependency[] =
        options[isDev ? 'additionalDevDependencies' : 'additionalDependencies'] || [];
    for (const dependency of dependenciesFromConfigJson) {
        dependency.from = 'config' as ScopeFrom;
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
            dependency.from = 'executable' as ScopeFrom;
            dependencies.push(dependency);
        }
    }

    // dependencies from package.json file
    const packageJsonTemplateFile = path.join(templatePath, name, 'package.json.hbs');
    if (await fileExist(packageJsonTemplateFile)) {
        const templateContent = await templateManager.proccessTemplate(
            packageJsonTemplateFile,
            templateManager.createContextForPackage()
        );
        const packageJsonDependencies = getDataFromPackageJsonContent(
            JSON.parse(templateContent) as PackageJson,
            isDev ? 'devDependencies' : 'dependencies'
        );
        for (const dependency of packageJsonDependencies) {
            dependency.from = 'template' as ScopeFrom;
            dependencies.push(dependency as PackageDependency);
        }
    }
    return dependencies;
};

export const loadScripts = async (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager,
    templateManager: TemplateManager,
    templatePath: string,
    name: string,
    options: PackageOptions,
    executables: ScriptsObject
): Promise<PackageScript[]> => {
    const scripts: PackageScript[] = [];

    // scripts from the config.json
    const scriptsFromConfigJson: PackageScript[] = options.additionalScripts || [];
    for (const script of scriptsFromConfigJson) {
        script.from = 'config' as ScopeFrom;
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
            script.from = 'executable' as ScopeFrom;
            scripts.push(script);
        }
    }

    // scripts from package.json file
    const packageJsonTemplateFile = path.join(templatePath, name, 'package.json.hbs');
    if (await fileExist(packageJsonTemplateFile)) {
        const templateContent = await templateManager.proccessTemplate(
            packageJsonTemplateFile,
            templateManager.createContextForPackage()
        );
        const packageJsonScripts = getDataFromPackageJsonContent(
            JSON.parse(templateContent) as PackageJson,
            'scripts'
        );
        for (const script of packageJsonScripts) {
            script.from = 'template' as ScopeFrom;
            scripts.push(script as PackageScript);
        }
    }
    return scripts;
};

export const loadEnvVars = async (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager,
    templateManager: TemplateManager,
    templatePath: string,
    name: string,
    options: PackageOptions,
    executables: ScriptsObject
): Promise<PackageEnvVar[]> => {
    const envVars: PackageEnvVar[] = [];

    // env vars from the config.json
    const envVarsFromConfigJson: PackageEnvVar[] = options.additionalEnvVars || [];
    for (const envVar of envVarsFromConfigJson) {
        envVar.from = 'config' as ScopeFrom;
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
            envVar.from = 'executable' as ScopeFrom;
            envVars.push(envVar);
        }
    }

    // env vars from package.json file
    const exampleEnvTemplateFile = path.join(templatePath, name, '.env.example.hbs');
    if (await fileExist(exampleEnvTemplateFile)) {
        const templateContent = await templateManager.proccessTemplate(
            exampleEnvTemplateFile,
            templateManager.createContextForPackage()
        );
        const lines = templateContent.split('\n');
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && value) {
                const envVar = {
                    name: key.trim(),
                    value: value.trim(),
                    from: 'template'
                } as PackageEnvVar;
                envVars.push(envVar);
            }
        }
    }
    return envVars;
};
