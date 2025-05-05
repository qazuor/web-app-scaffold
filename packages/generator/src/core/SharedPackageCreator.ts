import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import type { Package } from '../entity/Package.js';
import type {
    PackageDependency,
    PackageEnvVar,
    PackageScript,
    ScriptsObject
} from '../types/index.js';
import type { PackageTemplateContext } from '../types/package.js';
import {
    type FolderItem,
    copyFile,
    createDirectory,
    createFile,
    deleteFolder,
    folderExists,
    getContainingFolder,
    getFolderContent,
    getRelativePath
} from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';
import type { PromptManager } from './PromptManager.js';
import type { TemplateManager } from './TemplateManager.js';

export class SharedPackageCreator {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private packagesManager: PackagesManager;
    private promptManager: PromptManager;
    private templateManager: TemplateManager;
    private pkg: Package;
    private packageName: string;
    private packagePath: string;
    private templatePackagePath: string;

    private executableFiles: ScriptsObject = {};
    private packageDependencies: PackageDependency[] = [];
    private packageDevDependencies: PackageDependency[] = [];
    private packageScripts: PackageScript[] = [];
    private packageEnvVars: PackageEnvVar[] = [];

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager,
        promptManager: PromptManager,
        templateManager: TemplateManager,
        pkg: Package
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.packagesManager = packagesManager;
        this.promptManager = promptManager;
        this.templateManager = templateManager;
        this.pkg = pkg;
        this.packageName = this.pkg.getSharedPackageName() || this.pkg.getName();
        this.packagePath = path.join(process.cwd(), 'packages', this.packageName);
        this.templatePackagePath = path.join(
            this.configsManager.getPackagesTemplatesPath(),
            this.pkg.getName()
        );
    }

    async collectData() {
        this.executableFiles = this.pkg.getExecutableScripts();
        this.packageDependencies = this.pkg.getDependencies();
        this.packageDevDependencies = this.pkg.getDevDependencies();
        this.packageScripts = this.pkg.getScripts();
        this.packageEnvVars = this.pkg.getEnvVars();
    }

    async createNewPackageFileStructure() {
        if (await folderExists(this.packagePath)) {
            await this.handledFolderExist();
        }
        await this.collectData();
        await createDirectory(this.packagePath);
        const folderContent: FolderItem[] = await getFolderContent(this.templatePackagePath);

        await this.executeFileFromTemplate(this.executableFiles.preInstall);
        await this.processFolderContent(folderContent);
        await this.executeFileFromTemplate(this.executableFiles.postInstall);
    }

    async handledFolderExist() {
        const overwrite = await this.promptManager.promptForOverwriteSharedPackageFolder(this.pkg);
        if (overwrite === 'exit') {
            logger.error(
                `An shared package named '${this.packageName}' already exists. Please choose a different name or delete the existing folder.`
            );
            process.exit(0);
        }
        if (overwrite === 'new-name') {
            this.packageName = await this.promptManager.promptForSharedPackageName(this.pkg);
            this.packagePath = path.join(process.cwd(), 'packages', this.packageName);
            this.pkg.setSharedPackageName(this.packageName);
            return;
        }
        if (overwrite === 'overwrite') {
            await deleteFolder(this.packagePath);
        }
    }

    async executeFileFromTemplate(
        executableFile: string | undefined,
        loggerMsg: string | undefined = undefined
    ): Promise<boolean | undefined> {
        if (executableFile) {
            const executableFileClass = await import(
                path.join(this.templatePackagePath, 'scripts', executableFile)
            );
            logger.warn(
                chalk.bgRed.bold(
                    loggerMsg
                        ? loggerMsg
                        : `Execute ${getRelativePath(executableFile)} shared package script`
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
                path.join(
                    this.templatePackagePath,
                    'scripts',
                    this.executableFiles.templateContextVars
                )
            );
            return await contextVarClass.getContextVars(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
        }
    }

    async processFolderContent(folderContent: FolderItem[]): Promise<void> {
        const contextVars = await this.getContextVars();
        const context = this.templateManager.createContextForPackage(
            this.pkg,
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            contextVars
        );
        for (const item of folderContent) {
            if (item.isFolder) {
                if (item.relativePath !== 'sharedPackagesFiles' && item.relativePath !== 'files') {
                    await createDirectory(path.join(this.packagePath, item.relativePath));
                }
            } else if (item.isSharedPackageFile) {
                if (item.isPackageJsonFile) {
                    await this.processPackageJsonFile(item, context);
                } else if (item.isEnvFile) {
                    await this.processEnvFile(item, context);
                } else if (item.isTemplate || item.isConfigFile) {
                    await this.processTemplateFile(item, context);
                }
            } else if (item.isTemplate || item.isConfigFile) {
                await this.processTemplateFile(item, context);
            } else {
                await createDirectory(path.dirname(path.join(this.packagePath, item.relativePath)));
                await copyFile(
                    path.join(this.templatePackagePath, item.relativePath),
                    path.dirname(
                        path.join(
                            this.packagePath,
                            item.relativePath
                                .replace('files', '')
                                .replace('sharedPackagesFiles', '')
                        )
                    )
                );
            }
        }
    }

    async processTemplateFile(
        fileInfo: FolderItem,
        context: PackageTemplateContext
    ): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        await createFile(
            path.join(
                this.packagePath,
                fileInfo.relativePath
                    .replace('files', '')
                    .replace('sharedPackagesFiles', '')
                    .replace('.hbs', '')
            ),
            proccessedTemplate
        );
    }

    async processPackageJsonFile(
        fileInfo: FolderItem,
        context: PackageTemplateContext
    ): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        await createFile(
            path.join(
                this.packagePath,
                fileInfo.relativePath
                    .replace('files', '')
                    .replace('sharedPackagesFiles', '')
                    .replace('.hbs', '')
            ),
            proccessedTemplate
        );
    }

    async processEnvFile(fileInfo: FolderItem, context: PackageTemplateContext): Promise<void> {
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        const exampleEnvFile = path.join(
            this.packagePath,
            fileInfo.relativePath
                .replace('files', '')
                .replace('sharedPackagesFiles', '')
                .replace('.hbs', '')
        );
        await createFile(exampleEnvFile, proccessedTemplate);
        await createFile(exampleEnvFile.replace('.env.example', '.env'), proccessedTemplate);
    }

    async processNormalFile(fileInfo: FolderItem): Promise<void> {
        await copyFile(
            fileInfo.fullPath,
            path.join(this.packagePath, getContainingFolder(fileInfo.relativePath))
        );
    }
}
