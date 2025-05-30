import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import type { Framework } from '../entity/Framework.js';
import type { Package } from '../entity/Package.js';
import type { GeneratorOptions } from '../types/generator.js';
import type { MetadataOptions } from '../types/metadata.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCompiledCode = __dirname.includes('dist');
const templatesDir = path.join(__dirname, isCompiledCode ? '..' : '..', 'templates');

export class ConfigsManager {
    private config: GeneratorOptions;
    private nextAvailablePort: number;

    private uiLibrary!: Package;
    private iconLibrary!: Package;
    private selectedPackages: Package[] = [];
    private framework!: Framework;

    constructor(config: GeneratorOptions) {
        this.config = config;
        this.nextAvailablePort = 4000; // Default starting port

        this.config.templatesPath = templatesDir;
        this.config.frameworksTemplatesPath = path.join(templatesDir, 'frameworks');
        this.config.packagesTmplatesPath = path.join(templatesDir, 'packages');
    }

    public getConfigOptions(): GeneratorOptions {
        return this.config;
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

    public getFramework(): Framework {
        return this.framework;
    }

    public getFrameworkName(): string {
        return this.framework?.getName() || this.config.framework;
    }

    public getPort(): number {
        return this.config.port;
    }

    public setName(name: string): void {
        this.config.name = name;
    }

    public setFramework(framework: Framework): void {
        this.framework = framework;
        this.config.framework = this.framework.getName();
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

    public getBugsUrl(): string {
        return this.getMetadata().bugs || '';
    }

    public getBugsEmail(): string {
        return this.getMetadata().author?.match(/<(.+?)>/)?.[1] || '';
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

    public async setUILIbrary(pkg: Package) {
        this.uiLibrary = pkg;
        await this.addSelectedPackage(pkg);
    }

    public getUILibrary() {
        return this.uiLibrary;
    }

    public async setIconLibrary(pkg: Package) {
        this.iconLibrary = pkg;
        await this.addSelectedPackage(pkg);
    }

    public getIconLibrary() {
        return this.iconLibrary;
    }

    public getSelectedPackage(): Package[] {
        return this.selectedPackages;
    }

    public async addSelectedPackage(pkg: Package) {
        this.selectedPackages.push(pkg);
        if (!this.config.selectedPackages) {
            this.config.selectedPackages = [];
        }
        this.config.selectedPackages.push(pkg.getPackageOptions());
    }

    getSharedPackages(): Package[] {
        return this.selectedPackages.filter((pkg) => pkg.instalallAsSharedPackage());
    }
}
