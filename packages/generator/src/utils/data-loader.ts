import path from 'node:path';
import { logger } from '@repo/logger';
import type { PackageJson } from 'type-fest';
import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import type { PackagesManager } from '../core/PackagesManager.js';
import type { TemplateManager } from '../core/TemplateManager.js';
import type {
    PackageDependency,
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
    logger.info(`Loading ${isDev ? 'dev ' : ''} dependencies for ${name}...`);
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
