import { Package } from '../entity/Package.js';
import type { ConfigFile } from '../types/config.js';
import type { PackageOptions } from '../types/package.js';
import { findAllConfigJson } from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';

export class PackagesManager {
    private config: ConfigsManager;
    private packages: Package[];

    constructor(config: ConfigsManager) {
        this.config = config;
        this.packages = [];
    }

    public async initializePackages(): Promise<void> {
        this.packages = await this.loadConfigs();
    }

    private async loadConfigs(): Promise<Package[]> {
        const configs: ConfigFile[] = await findAllConfigJson(
            this.config.getPackagesTemplatesPath()
        );
        return configs.map((config): Package => {
            return new Package(config.content as PackageOptions);
        });
    }

    public getPackages(): Package[] {
        return this.packages;
    }

    public getPackageByName(name: string): Package {
        const pkg = this.packages.find((pkg) => pkg.getName() === name);
        if (!pkg) {
            throw new Error(`Package ${name} not found`);
        }
        return pkg;
    }

    public getUILibraryPackages(frameworkName?: string): Package[] | [] {
        return (
            this.packages.filter((pkg) => {
                return (
                    pkg.isUILibrary() &&
                    (!frameworkName || pkg.getFrameworks().includes(frameworkName))
                );
            }) || []
        );
    }

    public getIconLibraryPackages(frameworkName?: string): Package[] | [] {
        return (
            this.packages.filter((pkg) => {
                return (
                    pkg.isIconLibrary() &&
                    (!frameworkName || pkg.getFrameworks().includes(frameworkName))
                );
            }) || []
        );
    }

    public getPackagesForFrameowrk(frameworkName: string): Package[] | [] {
        return (
            this.packages.filter((pkg) => {
                return (
                    pkg.getFrameworks().includes(frameworkName) &&
                    !pkg.isUILibrary() &&
                    !pkg.isIconLibrary()
                );
            }) || []
        );
    }
}
