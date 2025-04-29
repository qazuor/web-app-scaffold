import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import type { GeneratorOptions } from '../types/generator.js';
import type { PromptManager } from './PromptManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCompiledCode = __dirname.includes('dist');
const templatesDir = path.join(__dirname, isCompiledCode ? '..' : '..', 'templates');

export class ConfigsManager {
    private config: GeneratorOptions;
    private nextAvailablePort: number;

    constructor(config: GeneratorOptions) {
        this.config = config;
        this.nextAvailablePort = 4000; // Default starting port

        this.config.templatesPath = templatesDir;
        this.config.frameworksTemplatesPath = path.join(templatesDir, 'frameworks');
        this.config.packagesTmplatesPath = path.join(templatesDir, 'packages');
    }

    public async validatePaths(): Promise<void> {
        // Validate templates directory
        if (!(await fs.pathExists(this.getTemplatesPath()))) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.'
            });
            process.exit(1);
        }
        // Validate frameworks templates directory
        if (!(await fs.pathExists(this.getFrameworksTemplatesPath()))) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.'
            });
            process.exit(1);
        }
        // Validate packages templates directory
        if (!(await fs.pathExists(this.getPackagesTemplatesPath()))) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.'
            });
            process.exit(1);
        }
    }

    public getTemplatesPath(): string {
        return this.config.templatesPath;
    }

    public getFrameworksTemplatesPath(): string {
        return this.config.frameworksTemplatesPath;
    }

    public getPackagesTemplatesPath(): string {
        return this.config.packagesTmplatesPath;
    }

    public getName(): string {
        return this.config.name;
    }

    public getFramework(): string {
        return this.config.framework;
    }

    public getPort(): number {
        return this.config.port;
    }

    public setName(name: string): void {
        this.config.name = name;
    }

    public setFramework(framework: string): void {
        this.config.framework = framework;
    }

    public setPort(port: number): void {
        this.config.port = port;
    }

    public getDescription(): string {
        return this.config.description;
    }

    public setDescription(description: string): void {
        this.config.description = description;
    }

    public getNextAvailablePort(): number {
        return this.nextAvailablePort;
    }

    public setNextAvailablePort(port: number): void {
        this.nextAvailablePort = port;
    }

    public async gatherConfiguration(
        promptManager: PromptManager
    ): Promise<Record<string, unknown>> {
        // framework
        const framwork = await promptManager.promptForFramework();
        this.setFramework(framwork);

        // name
        const name = await promptManager.promptForAppName();
        this.setName(name);

        // description
        const description = await promptManager.promptForDescription();
        this.setDescription(description);

        // port
        const port = await promptManager.promptForAppPort();
        this.setPort(port);

        return { framwork, name, description, port };
    }
}
