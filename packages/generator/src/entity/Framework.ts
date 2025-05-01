import type { FrameworkOptions } from '../types/framework.js';
import type { PackageDependency, PackageEnvVar, PackageScript } from '../types/index.js';

export class Framework {
    private data: FrameworkOptions;
    private dependencies: PackageDependency[] = [];
    private devDependencies: PackageDependency[] = [];
    private scripts: PackageScript[] = [];
    private envVars: PackageEnvVar[] = [];

    constructor(data: FrameworkOptions) {
        this.data = data;
    }

    public getFrameworkOptions(): FrameworkOptions {
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

    public hasUI(): boolean {
        return this.data.hasUI ?? false;
    }

    public getDependencies(): PackageDependency[] {
        return this.dependencies;
    }

    public setDependencies(dependencies: PackageDependency[]): void {
        this.dependencies = dependencies;
    }

    public getDevDependencies(): PackageDependency[] {
        return this.devDependencies;
    }

    public setDevDependencies(devDependencies: PackageDependency[]): void {
        this.devDependencies = devDependencies;
    }

    public getScripts(): PackageScript[] {
        return this.scripts;
    }

    public setScripts(scripts: PackageScript[]): void {
        this.scripts = scripts;
    }

    public getEnvVars(): PackageEnvVar[] {
        return this.envVars;
    }

    public setEnvVars(envVars: PackageEnvVar[]): void {
        this.envVars = envVars;
    }

    public getTestingDependencies(): PackageDependency[] {
        return this.data.testingDependencies ?? [];
    }

    public getTestingScripts(): PackageScript[] {
        return this.data.testingScripts ?? [];
    }

    public getDefaultAppName(): string {
        return this.data.defaultAppName;
    }

    public getDefaultAppDescription(): string {
        return this.data.defaultAppDescription;
    }
}
