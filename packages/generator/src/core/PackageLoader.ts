import path from 'node:path';
import { logger } from '@repo/logger';
import type { PackageJson } from 'type-fest';
import type { Package } from '../entity/Package.js';
import type {
    PackageDependency,
    PackageEnvVar,
    PackageScript,
    ScopeFrom,
    ScriptsObject
} from '../types/index.js';
import { getDataFromPackageJsonContent, loadDependencies } from '../utils/data-loader.js';
import {
    type FolderItem,
    fileExist,
    getFolderContent,
    getFolderScripts
} from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';
import type { TemplateManager } from './TemplateManager.js';

export class PackageLoader {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private packagesManager: PackagesManager;
    private templateManager: TemplateManager;
    private templatePackagesPath: string;

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager,
        templateManager: TemplateManager
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.packagesManager = packagesManager;
        this.templateManager = templateManager;
        this.templatePackagesPath = this.configsManager.getPackagesTemplatesPath();
    }

    public async updatePackages(packages: Package[]): Promise<void> {
        for (const pkg of packages) {
            await this.updatePackage(pkg);
        }
    }

    private async updatePackage(pkg: Package): Promise<void> {
        await this.loadExecutableFiles(pkg);
        await this.loadDependencies(pkg);
        await this.loadDevDependencies(pkg);
        await this.loadScripts(pkg);
        await this.loadEnvVars(pkg);
        await this.loadNormalTemplateFiles(pkg);
    }

    private async loadExecutableFiles(pkg: Package): Promise<void> {
        const executableFiles: ScriptsObject = await getFolderScripts(
            path.join(this.templatePackagesPath, pkg.getName())
        );
        pkg.setExecutableScripts(executableFiles);
    }

    private async loadDependencies(pkg: Package): Promise<void> {
        logger.info(`Loading dev dependencies for ${pkg.getName()}...`);
        const dependencies: PackageDependency[] = await loadDependencies(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.templateManager,
            this.templatePackagesPath,
            pkg.getName(),
            pkg.getPackageOptions(),
            pkg.getExecutableScripts()
        );
        pkg.setDependencies(dependencies);
    }

    private async loadDevDependencies(pkg: Package): Promise<void> {
        logger.info(`Loading dev dependencies for ${pkg.getName()}...`);
        const devDependencies: PackageDependency[] = await loadDependencies(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.templateManager,
            this.templatePackagesPath,
            pkg.getName(),
            pkg.getPackageOptions(),
            pkg.getExecutableScripts(),
            true
        );
        pkg.setDevDependencies(devDependencies);
    }

    private async loadScripts(pkg: Package): Promise<void> {
        logger.info(`Loading scripts for ${pkg.getName()}...`);
        const scripts: PackageScript[] = [];

        // scripts from the config.json
        const scriptsFromConfigJson: PackageScript[] =
            pkg.getPackageOptions().additionalScripts || [];
        for (const script of scriptsFromConfigJson) {
            script.from = 'config' as ScopeFrom;
            scripts.push(script);
        }

        // scripts from executable file
        const executableFile = pkg.getExecutableScripts().scripts;
        if (executableFile) {
            const executableFileClass = await import(
                path.join(this.templatePackagesPath, pkg.getName(), 'scripts', executableFile)
            );
            const scriptsFromExecutableFiles = await executableFileClass.getScripts(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
            for (const script of scriptsFromExecutableFiles) {
                script.from = 'executable' as ScopeFrom;
                scripts.push(script);
            }
        }

        // scripts from package.json file
        const packageJsonTemplateFile = path.join(
            this.templatePackagesPath,
            pkg.getName(),
            'package.json.hbs'
        );
        if (await fileExist(packageJsonTemplateFile)) {
            const templateContent = await this.templateManager.proccessTemplate(
                packageJsonTemplateFile,
                this.templateManager.createContextForPackage()
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
        pkg.setScripts(scripts);
    }

    private async loadEnvVars(pkg: Package): Promise<void> {
        logger.info(`Loading env vars for ${pkg.getName()}...`);
        const envVars: PackageEnvVar[] = [];

        // env vars from the config.json
        const envVarsFromConfigJson: PackageEnvVar[] =
            pkg.getPackageOptions().additionalEnvVars || [];
        for (const envVar of envVarsFromConfigJson) {
            envVar.from = 'config' as ScopeFrom;
            envVars.push(envVar);
        }

        // env vars from executable file
        const executableFile = pkg.getExecutableScripts().envVars;
        if (executableFile) {
            const executableFileClass = await import(
                path.join(this.templatePackagesPath, pkg.getName(), 'scripts', executableFile)
            );
            const envVarsFromExecutableFiles = await executableFileClass.getVars(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
            for (const envVar of envVarsFromExecutableFiles) {
                envVar.from = 'executable' as ScopeFrom;
                envVars.push(envVar);
            }
        }

        // env vars from package.json file
        const exampleEnvTemplateFile = path.join(
            this.templatePackagesPath,
            pkg.getName(),
            '.env.example.hbs'
        );
        if (await fileExist(exampleEnvTemplateFile)) {
            const templateContent = await this.templateManager.proccessTemplate(
                exampleEnvTemplateFile,
                this.templateManager.createContextForPackage()
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
        pkg.setEnvVars(envVars);
    }

    private async loadNormalTemplateFiles(pkg: Package): Promise<void> {
        logger.info(`Loading normal template files for ${pkg.getName()}...`);
        const templateFiles = await getFolderContent(
            path.join(this.templatePackagesPath, pkg.getName())
        );
        const files: Record<string, FolderItem> = {};
        for (const templateFile of templateFiles) {
            files[templateFile.relativePath] = templateFile;
        }
        pkg.setTemplateFiles(files);
    }
}
