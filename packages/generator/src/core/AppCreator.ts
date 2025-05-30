import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import type { Framework } from '../entity/Framework.js';
import type { FrameworkTemplateContext } from '../types/framework.js';
import type {
    PackageDependency,
    PackageEnvVar,
    PackageScript,
    ScopeFrom,
    ScriptsObject
} from '../types/index.js';
import {
    type CreatedApp,
    type SharedPackage,
    registerApp,
    registerPort,
    registerSharedPackage
} from '../utils/creation-tracking.js';
import { loadDependencies, loadEnvVars, loadScripts } from '../utils/data-loader.js';
import {
    type FolderItem,
    copyFile,
    createDirectory,
    createFile,
    deleteFolder,
    folderExists,
    getContainingFolder,
    getFolderContent,
    getFolderScripts,
    getRelativePath
} from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';
import type { PromptManager } from './PromptManager.js';
import { SharedPackageCreator } from './SharedPackageCreator.js';
import type { TemplateManager } from './TemplateManager.js';

export class AppCreator {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private packagesManager: PackagesManager;
    private promptManager: PromptManager;
    private templateManager: TemplateManager;
    private appName: string;
    private appPath: string;
    private templateAppPath: string;
    private appFramework: Framework;

    private executableFiles: ScriptsObject = {};
    private appDependencies: PackageDependency[] = [];
    private appDevDependencies: PackageDependency[] = [];
    private appScripts: PackageScript[] = [];
    private appEnvVars: PackageEnvVar[] = [];

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager,
        promptManager: PromptManager,
        templateManager: TemplateManager
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.packagesManager = packagesManager;
        this.promptManager = promptManager;
        this.appName = this.configsManager.getName();
        this.appFramework = this.configsManager.getFramework();
        this.appPath = path.join(process.cwd(), 'apps', this.appName);
        this.templateAppPath = path.join(
            this.configsManager.getFrameworksTemplatesPath(),
            this.appFramework.getName()
        );
        this.templateManager = templateManager;
    }

    async collectData() {
        this.executableFiles = await getFolderScripts(this.templateAppPath);
        this.appDependencies = await this.loadDependencies();
        this.appDevDependencies = await this.loadDevDependencies();
        this.appScripts = await this.loadScripts();
        this.appEnvVars = await this.loadEnvVars();
    }

    async createNewAppFileStructure() {
        if (await folderExists(this.appPath)) {
            await this.handledFolderExist();
        }
        await this.collectData();
        await createDirectory(this.appPath);
        const folderContent: FolderItem[] = await getFolderContent(this.templateAppPath);

        await this.executeFileFromTemplate(this.executableFiles.preInstall);
        await this.addSharedPackages();
        await this.processFolderContent(folderContent);
        await this.executeFileFromTemplate(this.executableFiles.postInstall);
        await registerApp({
            name: this.appName,
            port: this.configsManager.getPort(),
            framework: this.appFramework.getName(),
            sharedPackages: this.configsManager
                .getSharedPackages()
                .map((pkg) => pkg.getSharedPackageName())
        } as CreatedApp);
        await registerPort(this.appName, this.configsManager.getPort());
    }

    async handledFolderExist() {
        const overwrite = await this.promptManager.promptForOverwriteAppFolder();
        if (overwrite === 'exit') {
            logger.error(
                `An application named '${this.appName}' already exists. Please choose a different name or delete the existing folder.`
            );
            process.exit(0);
        }
        if (overwrite === 'new-name') {
            this.appName = await this.promptManager.promptForAppName(true);
            this.appPath = path.join(process.cwd(), 'apps', this.appName);
            this.configsManager.setName(this.appName);
            return;
        }
        if (overwrite === 'overwrite') {
            await deleteFolder(this.appPath);
        }
    }

    async executeFileFromTemplate(
        executableFile: string | undefined,
        loggerMsg: string | undefined = undefined
    ): Promise<boolean | undefined> {
        if (executableFile) {
            const executableFileClass = await import(
                path.join(this.templateAppPath, 'scripts', executableFile)
            );
            logger.warn(
                chalk.bgRed.bold(
                    loggerMsg ? loggerMsg : `Execute ${getRelativePath(executableFile)} app script`
                )
            );
            return await executableFileClass.exec(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
        }
    }

    async getContextVars(): Promise<Record<string, unknown> | undefined> {
        if (this.executableFiles.templateContextVars) {
            const contextVarClass = await import(
                path.join(this.templateAppPath, 'scripts', this.executableFiles.templateContextVars)
            );
            return await contextVarClass.getContextVars(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
        }
    }

    async addSharedPackages(): Promise<void> {
        const sharedPackages = this.configsManager
            .getSharedPackages()
            .filter((pkg) => !pkg.getUseAlreadyInstalledSharedPackage());
        if (sharedPackages.length > 0) {
            logger.info('Adding shared packages...');
            for (const pkg of sharedPackages) {
                logger.info(`Adding shared package: ${pkg.getName()}`);
                const sharedPackageCreator = new SharedPackageCreator(
                    this.configsManager,
                    this.frameworksManager,
                    this.packagesManager,
                    this.promptManager,
                    this.templateManager,
                    pkg
                );
                await sharedPackageCreator.createNewPackageFileStructure();
                const sharedPackageDependency: PackageDependency = {
                    name: `@repo/${pkg.getSharedPackageName()}`,
                    version: pkg.getVersion(),
                    addInApp: true,
                    addInShared: false,
                    from: {
                        type: 'sharedPackage',
                        scope: 'app'
                    }
                };

                this.appFramework.addDependency(sharedPackageDependency);
                await registerSharedPackage(this.appName, {
                    name: pkg.getSharedPackageName(),
                    basePackage: pkg.getName()
                } as SharedPackage);
            }
        }
    }

    async processFolderContent(folderContent: FolderItem[]): Promise<void> {
        const contextVars = await this.getContextVars();
        const context = this.templateManager.createContextForFramework(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            contextVars
        );
        for (const item of folderContent) {
            if (item.isPackageJsonFile) {
                await this.processPackageJsonFile(item, context);
            } else if (item.isEnvFile) {
                await this.processEnvFile(item, context);
            } else if (item.isTemplate || item.isConfigFile) {
                await this.processTemplateFile(item, context);
            } else if (!item.isFolder) {
                await createDirectory(
                    path.dirname(path.join(this.appPath, item.relativePath.replace('files', '')))
                );
                await copyFile(
                    path.join(this.templateAppPath, item.relativePath),
                    path.dirname(path.join(this.appPath, item.relativePath.replace('files', '')))
                );
            }
        }
    }

    async processTemplateFile(
        fileInfo: FolderItem,
        context: FrameworkTemplateContext
    ): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        await createFile(
            path.join(this.appPath, fileInfo.relativePath.replace('files', '').replace('.hbs', '')),
            proccessedTemplate
        );
    }

    async processPackageJsonFile(
        fileInfo: FolderItem,
        context: FrameworkTemplateContext
    ): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        await createFile(
            path.join(this.appPath, fileInfo.relativePath.replace('files', '').replace('.hbs', '')),
            proccessedTemplate
        );
    }

    async processEnvFile(fileInfo: FolderItem, context: FrameworkTemplateContext): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        const exampleEnvFile = path.join(this.appPath, fileInfo.relativePath.replace('.hbs', ''));
        await createFile(exampleEnvFile, proccessedTemplate);
        await createFile(exampleEnvFile.replace('.env.example', '.env'), proccessedTemplate);
    }

    async processNormalFile(fileInfo: FolderItem): Promise<void> {
        await copyFile(
            fileInfo.fullPath,
            path.join(this.appPath, getContainingFolder(fileInfo.relativePath))
        );
    }

    async loadDependencies(): Promise<PackageDependency[]> {
        logger.info(`Loading dependencies for ${this.appFramework.getName()}...`);
        // dependencies from app
        const dependencies: PackageDependency[] = await loadDependencies(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.configsManager.getFrameworksTemplatesPath(),
            this.appFramework.getName(),
            this.appFramework.getFrameworkOptions(),
            this.executableFiles,
            'app'
        );

        // dependencies from selected packages
        const selectedPackages = this.configsManager
            .getSelectedPackage()
            .filter(
                (pkg) =>
                    !pkg.instalallAsSharedPackage() && !pkg.getUseAlreadyInstalledSharedPackage()
            );
        for (const pkg of selectedPackages) {
            dependencies.push(...pkg.getDependencies());
        }

        this.appFramework.setDependencies(dependencies);

        // dependencies from already shared packages
        const alreadySharedPackages = this.configsManager
            .getSelectedPackage()
            .filter((pkg) => pkg.getUseAlreadyInstalledSharedPackage());
        for (const pkg of alreadySharedPackages) {
            const sharedPackageDependency: PackageDependency = {
                name: `@repo/${pkg.getSharedPackageName()}`,
                version: pkg.getVersion(),
                addInApp: true,
                addInShared: false,
                from: {
                    type: 'sharedPackage',
                    scope: 'app'
                }
            };

            this.appFramework.addDependency(sharedPackageDependency);
        }
        return dependencies;
    }

    async loadDevDependencies(): Promise<PackageDependency[]> {
        logger.info(`Loading dev dependencies for ${this.appFramework.getName()}...`);
        // dev dependencies from app
        const devDependencies: PackageDependency[] = await loadDependencies(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.configsManager.getFrameworksTemplatesPath(),
            this.appFramework.getName(),
            this.appFramework.getFrameworkOptions(),
            this.executableFiles,
            'app',
            true
        );

        // dev dependencies from selected packages
        for (const pkg of this.configsManager.getSelectedPackage()) {
            devDependencies.push(...pkg.getDevDependencies());
        }

        // dev dependencies from app testing dependencies
        for (const dependency of this.appFramework.getTestingDependencies()) {
            dependency.from = { scope: 'app', type: 'testing' } as ScopeFrom;
            devDependencies.push(dependency);
        }

        this.appFramework.setDevDependencies(devDependencies);
        return devDependencies;
    }

    async loadScripts(): Promise<PackageScript[]> {
        logger.info(`Loading scripts for ${this.appFramework.getName()}...`);
        const scripts: PackageScript[] = await loadScripts(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.configsManager.getFrameworksTemplatesPath(),
            this.appFramework.getName(),
            this.appFramework.getFrameworkOptions(),
            this.executableFiles,
            'app'
        );

        // scripts from the packages selected
        for (const pkg of this.configsManager.getSelectedPackage()) {
            scripts.push(...pkg.getScripts());
        }

        // scripts from app testing scripts
        for (const script of this.appFramework.getTestingScripts()) {
            script.from = { scope: 'app', type: 'testing' } as ScopeFrom;
            scripts.push(script);
        }

        this.appFramework.setScripts(scripts);
        return scripts;
    }

    async loadEnvVars(): Promise<PackageEnvVar[]> {
        logger.info(`Loading env vars for ${this.appFramework.getName()}...`);
        const envVars: PackageEnvVar[] = await loadEnvVars(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            this.configsManager.getFrameworksTemplatesPath(),
            this.appFramework.getName(),
            this.appFramework.getFrameworkOptions(),
            this.executableFiles,
            'app'
        );

        // env vars from selected packages
        for (const pkg of this.configsManager.getSelectedPackage()) {
            envVars.push(...pkg.getEnvVars());
        }

        this.appFramework.setEnvVars(envVars);
        return envVars;
    }
}
