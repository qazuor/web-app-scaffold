import type { PackageInstallationInfo, PackageOptions } from '../types/package.js';

export class Package {
    private data: PackageOptions;

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

    // public getMetadata(): PackageOptions {
    //     return {
    //         author: metadata.author,
    //         license: metadata.license,
    //         repository: {
    //             type: 'git',
    //             url: metadata.repository
    //         },
    //         bugs: {
    //             url: metadata.bugs,
    //             email: metadata.author.match(/<(.+?)>/)?.[1] || ''
    //         },
    //         homepage: metadata.homepage,
    //         keywords: metadata.keywords.split(',').map((keyword: string) => keyword.trim())
    //     };
    // }

    public getSharedPackageDefaultName(): string | undefined {
        return this.data.sharedPackageDefaultName;
    }

    public getSharedPackageDefaultDescription(): string | undefined {
        return this.data.sharedPackageDefaultDescription;
    }

    public setInstalationInfo(instalationTypeInfo: PackageInstallationInfo): void {
        this.data.installationInfo = instalationTypeInfo;
    }
}
