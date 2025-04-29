import type { PackageConfig, PackageOptions } from '../types/package.js';

export class Package {
    private data: PackageOptions;

    constructor(data: PackageOptions) {
        if (!data) {
            throw new Error('Package Config is required');
        }
        this.data = data;
    }

    public getPackageConfig(): PackageConfig {
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

    public isUILibrary(): boolean {
        return !!this.data.isUILibrary;
    }

    public isIconLibrary(): boolean {
        return !!this.data.isIconLibrary;
    }

    public getFrameworks(): string[] {
        return this.data.frameworks || [];
    }
}
