import type {
    ExtraOptionPrompt,
    PackageDependency,
    PackageEnvVar,
    PackageScript,
    ScriptsObject
} from '../types/index.js';
import type { PackageInstallationInfo, PackageOptions } from '../types/package.js';
import { GeneratorError } from '../utils/error-handler.js';
import type { FolderItem } from '../utils/file-operations.js';

type ExtraOptionsPromptResult = Record<string, unknown>;
type ExtraOptionsPromptResults = Record<string, ExtraOptionsPromptResult>;

export class Package {
    private data: PackageOptions;
    private extraOptionsPromptResults: ExtraOptionsPromptResults = {};
    private dependencies: PackageDependency[] = [];
    private devDependencies: PackageDependency[] = [];
    private scripts: PackageScript[] = [];
    private envVars: PackageEnvVar[] = [];
    private executableScripts: ScriptsObject = {};
    private templateFiles: Record<string, FolderItem> = {};

    constructor(data: PackageOptions) {
        if (!data) {
            throw new Error('Package Config is required');
        }
        this.data = data;
    }

    public getPackageOptions(): PackageOptions {
        return this.data;
    }

    public getName(): string {
        return this.data.name;
    }

    public getDisplayName(): string {
        return this.data.displayName;
    }

    public getDescription(): string {
        return this.data.description;
    }

    public getVersion(): string {
        return this.data.version;
    }

    public isUILibrary(): boolean {
        return !!this.data.isUILibrary;
    }

    public isIconLibrary(): boolean {
        return !!this.data.isIconLibrary;
    }

    public getFrameworks(): string[] {
        return this.data.supportedFrameworks || [];
    }

    public canBeShared(): boolean {
        return !!this.data.canBeSharedPackage;
    }

    public hasExtraOptons(): boolean {
        return !!this.data.extraOptionsPrompts;
    }

    public getExtraOptionsPrompts(): ExtraOptionPrompt[] {
        return this.data.extraOptionsPrompts || [];
    }

    public setExtraOptionsPromptResult(extraOptionsPromptResult: ExtraOptionsPromptResult): void {
        if (!this.data.extraOptionsPrompts) {
            throw new Error('No extra options prompts found');
        }
        for (const key in extraOptionsPromptResult) {
            if (this.extraOptionsPromptResults[key]) {
                throw new GeneratorError(
                    `Duplicate key ${key} in extra options prompt result for pkg: ${this.getName()}`
                );
            }
            this.extraOptionsPromptResults[key] = extraOptionsPromptResult[
                key
            ] as ExtraOptionsPromptResult;
        }
    }

    public getExtraOptionsPromptsResults(): ExtraOptionsPromptResults {
        return this.extraOptionsPromptResults || [];
    }

    public getDependencies(): PackageDependency[] {
        return this.dependencies;
    }

    public addDependency(dependency: PackageDependency): void {
        this.dependencies.push(dependency);
    }

    public setDependencies(dependencies: PackageDependency[]): void {
        this.dependencies = dependencies;
    }

    public getDevDependencies(): PackageDependency[] {
        return this.devDependencies;
    }

    public addDevDependency(devDependencies: PackageDependency): void {
        this.devDependencies.push(devDependencies);
    }

    public setDevDependencies(devDependencies: PackageDependency[]): void {
        this.devDependencies = devDependencies;
    }

    public getScripts(): PackageScript[] {
        return this.scripts;
    }

    public addScript(script: PackageScript): void {
        this.scripts.push(script);
    }

    public setScripts(scripts: PackageScript[]): void {
        this.scripts = scripts;
    }

    public getEnvVars(): PackageEnvVar[] {
        return this.envVars;
    }

    public addEnvVar(envVar: PackageEnvVar): void {
        this.envVars.push(envVar);
    }

    public setEnvVars(envVars: PackageEnvVar[]): void {
        this.envVars = envVars;
    }

    public getExecutableScripts(): ScriptsObject {
        return this.executableScripts;
    }

    public addExecutableScript(executableScript: Record<string, string>): void {
        this.executableScripts = { ...this.executableScripts, ...executableScript };
    }

    public setExecutableScripts(executableScripts: ScriptsObject): void {
        this.executableScripts = executableScripts;
    }

    public getTemplateFiles(): Record<string, FolderItem> {
        return this.templateFiles;
    }

    public addTemplateFile(templateFile: Record<string, FolderItem>): void {
        this.templateFiles = { ...this.templateFiles, ...templateFile };
    }

    public setTemplateFiles(templateFiles: Record<string, FolderItem>): void {
        this.templateFiles = templateFiles;
    }

    public getSharedPackageDefaultName(): string | undefined {
        return this.data.sharedPackageDefaultName;
    }

    public getSharedPackageDefaultDescription(): string | undefined {
        return this.data.sharedPackageDefaultDescription;
    }

    public setInstalationInfo(instalationTypeInfo: PackageInstallationInfo): void {
        this.data.installationInfo = instalationTypeInfo;
    }

    public instalallAsSharedPackage(): boolean {
        return !!this.data.installationInfo?.isShared;
    }

    public getSharedPackageName(): string | undefined {
        return this.data.installationInfo?.packageName;
    }

    public getSharedPackageDescription(): string | undefined {
        return this.data.installationInfo?.packageDescription;
    }

    public setSharedPackageName(packageName: string): void {
        if (!this.data.installationInfo) {
            this.data.installationInfo = {
                isShared: true
            };
        }
        this.data.installationInfo.packageName = packageName;
    }

    public getDependenciesFromConfigs(): PackageDependency[] {
        return this.dependencies.filter((dependency) => dependency.from?.type === 'config');
    }

    public getDevDependenciesFromConfigs(): PackageDependency[] {
        return this.devDependencies.filter((dependency) => dependency.from?.type === 'config');
    }

    public getDynamicDependencies(): PackageDependency[] {
        return this.dependencies.filter((dependency) => dependency.from?.type === 'executable');
    }

    public getDynamicDevDependencies(): PackageDependency[] {
        return this.devDependencies.filter((dependency) => dependency.from?.type === 'executable');
    }

    public getScriptsFromConfigs(): PackageScript[] {
        return this.scripts.filter((script) => script.from?.type === 'config');
    }

    public getDynamicScripts(): PackageScript[] {
        return this.scripts.filter((script) => script.from?.type === 'executable');
    }

    public getEnvVarsFromConfigs(): PackageEnvVar[] {
        return this.envVars.filter((envVar) => envVar.from?.type === 'config');
    }

    public getDynamicEnvVars(): PackageEnvVar[] {
        return this.envVars.filter((envVar) => envVar.from?.type === 'executable');
    }
}
