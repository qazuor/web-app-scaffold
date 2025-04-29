import type { FrameworkOptions } from '../types/framework.js';

export class Framework {
    private data: FrameworkOptions;

    constructor(data: FrameworkOptions) {
        this.data = data;
    }

    public getFramworkOptions(): FrameworkOptions {
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

    public getDependencies(): { name: string; version: string }[] {
        return this.data.dependencies ?? [];
    }

    public getDevDependencies(): { name: string; version: string }[] {
        return this.data.devDependencies ?? [];
    }

    public getScripts(): { name: string; code: string }[] {
        return this.data.scripts ?? [];
    }

    public getTestingDependencies(): { name: string; version: string }[] {
        return this.data.testingDependencies ?? [];
    }

    public getTestingScripts(): { name: string; code: string }[] {
        return this.data.testingScripts ?? [];
    }

    public getDefaultAppName(): string {
        return this.data.defaultAppName;
    }

    public getDefaultAppDescription(): string {
        return this.data.defaultAppDescription;
    }
}
