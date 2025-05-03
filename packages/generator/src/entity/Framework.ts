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

    public addBiome(): boolean {
        return this.data.addBiome ?? false;
    }

    public addTesting(): boolean {
        return this.data.addTesting ?? false;
    }

    public getDependencies(): PackageDependency[] {
        return this.dependencies;
    }

    public getDependenciesFromConfigs(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) => dependency.from?.type === 'config' && dependency.from?.scope === 'app'
        );
    }

    public getDependenciesFromTemplates(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) => dependency.from?.type === 'template' && dependency.from?.scope === 'app'
        );
    }

    public getDynamicDependencies(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) =>
                dependency.from?.type === 'executable' && dependency.from?.scope === 'app'
        );
    }

    public getPackageDependenciesFromConfigs(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) =>
                dependency.from?.type === 'config' &&
                dependency.from?.scope === 'package' &&
                dependency.addInApp
        );
    }

    public getPackageDependenciesFromTemplates(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) =>
                dependency.from?.type === 'template' &&
                dependency.from?.scope === 'package' &&
                dependency.addInApp
        );
    }

    public getPackageDynamicDependencies(): PackageDependency[] {
        return this.dependencies.filter(
            (dependency) =>
                dependency.from?.type === 'executable' &&
                dependency.from?.scope === 'package' &&
                dependency.addInApp
        );
    }

    public setDependencies(dependencies: PackageDependency[]): void {
        this.dependencies = dependencies;
    }

    public getDevDependencies(): PackageDependency[] {
        return this.devDependencies;
    }

    public getDevDependenciesFromConfigs(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'config' && devDependency.from?.scope === 'app'
        );
    }

    public getDevDependenciesFromTemplates(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'template' && devDependency.from?.scope === 'app'
        );
    }

    public getDynamicDevDependencies(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'executable' && devDependency.from?.scope === 'app'
        );
    }

    public getPackageDevDependenciesFromConfigs(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'config' &&
                devDependency.from?.scope === 'package' &&
                devDependency.addInApp
        );
    }

    public getPackageDevDependenciesFromTemplates(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'template' &&
                devDependency.from?.scope === 'package' &&
                devDependency.addInApp
        );
    }

    public getPackageDynamicDevDependencies(): PackageDependency[] {
        return this.devDependencies.filter(
            (devDependency) =>
                devDependency.from?.type === 'executable' &&
                devDependency.from?.scope === 'package' &&
                devDependency.addInApp
        );
    }

    public setDevDependencies(devDependencies: PackageDependency[]): void {
        this.devDependencies = devDependencies;
    }

    public getScripts(): PackageScript[] {
        return this.scripts;
    }

    public getScriptsFromConfigs(): PackageScript[] {
        return this.scripts.filter(
            (script) => script.from?.type === 'config' && script.from?.scope === 'app'
        );
    }

    public getScriptsFromTemplates(): PackageScript[] {
        return this.scripts.filter(
            (script) => script.from?.type === 'template' && script.from?.scope === 'app'
        );
    }

    public getDynamicScripts(): PackageScript[] {
        return this.scripts.filter(
            (script) => script.from?.type === 'executable' && script.from?.scope === 'app'
        );
    }

    public getPackageScriptsFromConfigs(): PackageScript[] {
        return this.scripts.filter(
            (script) =>
                script.from?.type === 'config' &&
                script.from?.scope === 'package' &&
                script.addInApp
        );
    }

    public getPackageScriptsFromTemplates(): PackageScript[] {
        return this.scripts.filter(
            (script) =>
                script.from?.type === 'template' &&
                script.from?.scope === 'package' &&
                script.addInApp
        );
    }

    public getPackageDynamicScripts(): PackageScript[] {
        return this.scripts.filter(
            (script) =>
                script.from?.type === 'executable' &&
                script.from?.scope === 'package' &&
                script.addInApp
        );
    }

    public setScripts(scripts: PackageScript[]): void {
        this.scripts = scripts;
    }

    public getEnvVars(): PackageEnvVar[] {
        return this.envVars;
    }

    public getEnvVarsFromConfigs(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) => envVar.from?.type === 'config' && envVar.from?.scope === 'app'
        );
    }

    public getEnvVarsFromTemplates(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) => envVar.from?.type === 'template' && envVar.from?.scope === 'app'
        );
    }

    public getDynamicEnvVars(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) => envVar.from?.type === 'executable' && envVar.from?.scope === 'app'
        );
    }

    public getPackagesEnvVarsFromConfigs(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) =>
                envVar.from?.type === 'config' &&
                envVar.from?.scope === 'package' &&
                envVar.addInApp
        );
    }

    public getPackagesEnvVarsFromTemplates(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) =>
                envVar.from?.type === 'template' &&
                envVar.from?.scope === 'package' &&
                envVar.addInApp
        );
    }

    public getPackagesDynamicEnvVars(): PackageEnvVar[] {
        return this.envVars.filter(
            (envVar) =>
                envVar.from?.type === 'executable' &&
                envVar.from?.scope === 'package' &&
                envVar.addInApp
        );
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
