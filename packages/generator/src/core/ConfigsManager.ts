import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import type { GeneratorOptions } from '../types/generator.js';
import type { MetadataOptions } from '../types/metadata.js';

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

    public getAuthor(): string {
        return this.getMetadata().author || '';
    }

    public setAuthor(author: string): void {
        this.getMetadata().author = author;
    }

    public getHomepage(): string {
        return this.getMetadata().homepage || '';
    }

    public setHomepage(homepage: string): void {
        this.getMetadata().homepage = homepage;
    }

    public getRepo(): string {
        return this.getMetadata().repository || '';
    }

    public setRepo(repository: string): void {
        this.getMetadata().repository = repository;
    }

    public getBugs(): string {
        return this.getMetadata().bugs || '';
    }

    public setBugs(bugs: string): void {
        this.getMetadata().bugs = bugs;
    }

    public getLicense(): string {
        return this.getMetadata().license || '';
    }
    public setLicense(license: string): void {
        this.getMetadata().license = license;
    }
    public getKeywords(): string[] {
        return this.getMetadata().keywords || [];
    }
    public setKeywords(keywords: string[]): void {
        this.getMetadata().keywords = keywords;
    }

    public getMetadata() {
        if (!this.config.metadata) {
            this.config.metadata = {};
        }
        return this.config.metadata;
    }

    public getNextAvailablePort(): number {
        return this.nextAvailablePort;
    }

    public setNextAvailablePort(port: number): void {
        this.nextAvailablePort = port;
    }

    public setDefaultMetadata(metadata: MetadataOptions): void {
        this.config.metadata = { ...this.getMetadata(), ...metadata };
    }

    public getDefaultMetadata(): MetadataOptions {
        return this.getMetadata();
    }
}
