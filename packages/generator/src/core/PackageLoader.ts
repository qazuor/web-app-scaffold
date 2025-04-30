import path from 'node:path';
import { logger } from '@repo/logger';
import type { Package } from '../entity/Package.js';
import type { PackageDependency, ScriptsObject } from '../types/index.js';
import { loadDependencies, loadEnvVars, loadScripts } from '../utils/data-loader.js';
import { type FolderItem, getFolderContent, getFolderScripts } from '../utils/file-operations.js';
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
        const scripts = await loadScripts(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.templateManager,
            this.templatePackagesPath,
            pkg.getName(),
            pkg.getPackageOptions(),
            pkg.getExecutableScripts()
        );
        pkg.setScripts(scripts);
    }

    private async loadEnvVars(pkg: Package): Promise<void> {
        logger.info(`Loading env vars for ${pkg.getName()}...`);
        const envVars = await loadEnvVars(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.templateManager,
            this.templatePackagesPath,
            pkg.getName(),
            pkg.getPackageOptions(),
            pkg.getExecutableScripts()
        );
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
