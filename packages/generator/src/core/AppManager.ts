import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import type { FrameworkTemplateContext } from '../types/framework.js';
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
import { TemplateManager } from './TemplateManager.js';

export class AppManager {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private packagesManager: PackagesManager;
    private promptManager: PromptManager;
    private templateManager: TemplateManager;
    private appName: string;
    private appPath: string;
    private templateAppPath: string;
    private appFramework: string;

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager,
        promptManager: PromptManager
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
            this.appFramework
        );
        this.templateManager = new TemplateManager();
    }

    async createNewAppFileStructure() {
        if (await folderExists(this.appPath)) {
            await this.handledFolderExist();
        }
        createDirectory(this.appPath);
        const folderContent: FolderItem[] = await getFolderContent(this.templateAppPath);
        const executableFiles = await this.getExecutableFiles(folderContent);
        this.executeFileFromTemplate(executableFiles?.preinstall);
        await this.processFolderContent(
            folderContent.filter((item) => !item.isExecutableFile),
            executableFiles?.contextVars
        );
        this.executeFileFromTemplate(executableFiles?.postinstall);
    }

    async getExecutableFiles(folderContent: FolderItem[]): Promise<{
        preinstall: string | undefined;
        postinstall: string | undefined;
        contextVars: string | undefined;
    } | null> {
        const executableFiles = folderContent.filter((item) => item.isExecutableFile);
        if (executableFiles.length) {
            return {
                preinstall: executableFiles.find((item) => item.relativePath === 'pre-install.ts')
                    ?.fullPath,
                postinstall: executableFiles.find((item) => item.relativePath === 'post-install.ts')
                    ?.fullPath,
                contextVars: executableFiles.find(
                    (item) => item.relativePath === 'template-context-vars.ts'
                )?.fullPath
            };
        }
        return null;
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
        executableFile: string | undefined
    ): Promise<boolean | undefined> {
        if (executableFile) {
            const executableFileClass = await import(executableFile);
            logger.warn(
                chalk.bgRed.bold(`execute ${getRelativePath(executableFile)} install script`)
            );
            return await executableFileClass.exec(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
        }
    }

    async getContextVars(
        contextVarsGetterFile: string | undefined
    ): Promise<Record<string, unknown> | undefined> {
        if (contextVarsGetterFile) {
            const contextVarClass = await import(contextVarsGetterFile);
            return await contextVarClass.getContextVars(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager
            );
        }
    }

    async processFolderContent(
        folderContent: FolderItem[],
        contextVarsGetterFile: string | undefined
    ): Promise<void> {
        const contextVars = await this.getContextVars(contextVarsGetterFile);
        const context = this.templateManager.createContextForFramework(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager,
            contextVars
        );
        for (const item of folderContent) {
            if (item.isFolder) {
                await createDirectory(path.join(this.appPath, item.relativePath));
            } else if (item.isPackageJsonFile) {
                await this.processPackageJsonFile(item, context);
            } else if (item.isEnvFile) {
                await this.processEnvFile(item, context);
            } else if (item.isTemplate) {
                await this.processTemplateFile(item, context);
            } else if (!item.isExecutableFile) {
                await this.processNormalFile(item);
            } else {
                logger.error(`File type not supported: ${item.relativePath}`);
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
            path.join(this.appPath, fileInfo.relativePath.replace('.hbs', '')),
            proccessedTemplate
        );
    }

    async processPackageJsonFile(
        fileInfo: FolderItem,
        context: FrameworkTemplateContext
    ): Promise<void> {
        logger.warn(
            chalk.bgYellow.bold(`para los package.json files debemos armar las dependencias y scripts que tenemos
en los configs files, ademas debemos recorrer los packages seleccionados,
para recolectar las dependencias y scripts de esos packages`)
        );
        const proccessedTemplate = await this.templateManager.proccessTemplate(
            fileInfo.fullPath,
            context
        );
        await createFile(
            path.join(this.appPath, fileInfo.relativePath.replace('.hbs', '')),
            proccessedTemplate
        );
    }

    async processEnvFile(fileInfo: FolderItem, context: FrameworkTemplateContext): Promise<void> {
        logger.warn(
            chalk.bgYellow.bold(`para los env files vamos a aagregar envVars en el config.json que deben ser
agregadas al env file creado si es que existe uno en el framework template y
si no existe se creara uno con esas env vars. ademas debemos recorrer los
packages seleccionados, para recolectar los env vars de esos packages`)
        );
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
}
