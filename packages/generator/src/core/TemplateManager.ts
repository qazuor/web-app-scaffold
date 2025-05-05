import Handlebars from 'handlebars';
import type { Package } from '../entity/Package.js';
import type {
    AppEnvVarsTemplateContextVars,
    AppTemplateContextVars,
    DependenciesTemplateContextVars,
    FrameworkTemplateContext,
    FrameworkTemplateContextVars,
    ScriptsTemplateContextVars,
    SelectedPackagesTemplateContextVars
} from '../types/framework.js';
import type { PackageDependency, PackageEnvVar, PackageScript } from '../types/index.js';
import type {
    PackageDependenciesTemplateContextVars,
    PackageEnvVarsTemplateContextVars,
    PackageScriptsTemplateContextVars,
    PackageTemplateContext,
    PackageTemplateContextVars
} from '../types/package.js';
import { getFileContent } from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';

export class TemplateManager {
    constructor() {
        this.addHelpers();
    }

    private getDependenciesString(dependencies: PackageDependency[]): string[] | [] {
        if (!Array.isArray(dependencies) || dependencies.length === 0) {
            return [];
        }
        return dependencies.map((dependency) => {
            const sanitizedVersion = dependency.version.replace(/"/g, `'`);
            return `"${dependency.name}": "${sanitizedVersion}"`;
        });
    }

    private getScriptsString(scripts: PackageScript[]): string[] | [] {
        if (!Array.isArray(scripts) || scripts.length === 0) {
            return [];
        }
        return scripts.map((script) => {
            const sanitizedCommand = script.command.replace(/"/g, `'`);
            return `"${script.name}": "${sanitizedCommand}"`;
        });
    }

    // Register Handlebars helpers
    addHelpers(): void {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('includes', (array, value) => {
            if (!Array.isArray(array)) {
                return false;
            }
            return array.includes(value);
        });
        Handlebars.registerHelper(
            'getDependencies',
            (dependencies: DependenciesTemplateContextVars): Handlebars.SafeString | null => {
                const allDependencies = [
                    ...this.getDependenciesString(dependencies?.configAppDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicAppDependencies),
                    ...this.getDependenciesString(dependencies?.configPackagesDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicPackagesDependencies)
                ];
                return new Handlebars.SafeString(allDependencies.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getDevDependencies',
            (dependencies: DependenciesTemplateContextVars): Handlebars.SafeString | null => {
                const allDependencies = [
                    ...this.getDependenciesString(dependencies?.configAppDevDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicAppDevDependencies),
                    ...this.getDependenciesString(dependencies?.configPackagesDevDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicPackagesDevDependencies)
                ];
                return new Handlebars.SafeString(allDependencies.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getSharedPackageDependencies',
            (
                dependencies: PackageDependenciesTemplateContextVars
            ): Handlebars.SafeString | null => {
                const allDependencies = [
                    ...this.getDependenciesString(dependencies?.configDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicDependencies)
                ];
                return new Handlebars.SafeString(allDependencies.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getSharedPackageDevDependencies',
            (
                dependencies: PackageDependenciesTemplateContextVars
            ): Handlebars.SafeString | null => {
                const allDependencies = [
                    ...this.getDependenciesString(dependencies?.configDevDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicDevDependencies)
                ];
                return new Handlebars.SafeString(allDependencies.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getScripts',
            (scripts: ScriptsTemplateContextVars): Handlebars.SafeString | null => {
                const allScripts = [
                    ...this.getScriptsString(scripts?.configAppScripts),
                    ...this.getScriptsString(scripts?.dynamicAppScripts),
                    ...this.getScriptsString(scripts?.configPackagesScripts),
                    ...this.getScriptsString(scripts?.dynamicPackagesScripts)
                ];
                return new Handlebars.SafeString(allScripts.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getSharedPackageScripts',
            (scripts: PackageScriptsTemplateContextVars): Handlebars.SafeString | null => {
                const allScripts = [
                    ...this.getScriptsString(scripts?.configScripts),
                    ...this.getScriptsString(scripts?.dynamicScripts)
                ];
                return new Handlebars.SafeString(allScripts.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getEnvVars',
            (envVars: PackageEnvVar[]): Handlebars.SafeString | null => {
                if (!Array.isArray(envVars) || envVars.length === 0) {
                    return null;
                }
                const envVarsList = envVars.map((envVar) => {
                    const sanitizedEnvVar =
                        typeof envVar.value === 'string'
                            ? envVar.value.replace(/"/g, `'`).replace(/''/g, `'`)
                            : envVar.value;
                    return `${envVar.name}: '${sanitizedEnvVar}'`;
                });
                return new Handlebars.SafeString(envVarsList.join('\n'));
            }
        );
    }

    private getAppContextVars(configsManager: ConfigsManager): AppTemplateContextVars {
        return {
            name: new Handlebars.SafeString(configsManager.getName()) as unknown as string,
            port: new Handlebars.SafeString(
                configsManager.getPort() as unknown as string
            ) as unknown as number,
            description: new Handlebars.SafeString(
                configsManager.getDescription()
            ) as unknown as string,
            author: new Handlebars.SafeString(configsManager.getAuthor()) as unknown as string,
            license: new Handlebars.SafeString(configsManager.getLicense()) as unknown as string,
            homepage: new Handlebars.SafeString(configsManager.getHomepage()) as unknown as string,
            repoUrl: new Handlebars.SafeString(configsManager.getRepo()) as unknown as string,
            bugsUrl: new Handlebars.SafeString(configsManager.getBugsUrl()) as unknown as string,
            bugsEmail: new Handlebars.SafeString(configsManager.getBugsEmail()) as unknown as string
        } as AppTemplateContextVars;
    }

    private getPackageContextVars(pkg: Package): PackageTemplateContextVars {
        return {
            name: pkg.getName(),
            displayName: pkg.getDisplayName(),
            sharedName: new Handlebars.SafeString(
                pkg.getSharedPackageName() || ''
            ) as unknown as string,
            description: new Handlebars.SafeString(pkg.getDescription()) as unknown as string,
            sharedDescription: new Handlebars.SafeString(
                pkg.getSharedPackageDescription() || ''
            ) as unknown as string,
            version: pkg.getVersion()
        } as PackageTemplateContextVars;
    }

    private getFrameworkContextVars(configsManager: ConfigsManager): FrameworkTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            name: new Handlebars.SafeString(framework.getName()) as unknown as string,
            description: new Handlebars.SafeString(framework.getDescription()) as unknown as string,
            displayName: new Handlebars.SafeString(framework.getDisplayName()) as unknown as string,
            hasUI: framework.hasUI(),
            addBiome: framework.addBiome(),
            addTesting: framework.addTesting()
        } as FrameworkTemplateContextVars;
    }

    private getAppDependenciesContextVars(
        configsManager: ConfigsManager
    ): DependenciesTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            configAppDependencies: framework.getDependenciesFromConfigs(),
            configAppDevDependencies: framework.getDevDependenciesFromConfigs(),
            dynamicAppDependencies: framework.getDynamicDependencies(),
            dynamicAppDevDependencies: framework.getDynamicDevDependencies(),
            configPackagesDependencies: framework.getPackageDependenciesFromConfigs(),
            configPackagesDevDependencies: framework.getPackageDevDependenciesFromConfigs(),
            dynamicPackagesDependencies: framework.getPackageDynamicDependencies(),
            dynamicPackagesDevDependencies: framework.getPackageDynamicDevDependencies()
        } as DependenciesTemplateContextVars;
    }

    private getAppScriptsContextVars(configsManager: ConfigsManager): ScriptsTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            configAppScripts: framework.getScriptsFromConfigs(),
            dynamicAppScripts: framework.getDynamicScripts(),
            configPackagesScripts: framework.getPackageScriptsFromConfigs(),
            dynamicPackagesScripts: framework.getPackageDynamicScripts()
        } as ScriptsTemplateContextVars;
    }

    private getAppEnvVarsContextVars(
        configsManager: ConfigsManager
    ): AppEnvVarsTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            configAppEnvVars: framework.getEnvVarsFromConfigs(),
            dynamicAppEnvVars: framework.getDynamicEnvVars(),
            configPackagesEnvVars: framework.getPackagesDynamicEnvVars(),
            dynamicPackagesEnvVars: framework.getPackagesDynamicEnvVars()
        } as AppEnvVarsTemplateContextVars;
    }

    private getPackageDependenciesContextVars(
        pkg: Package
    ): PackageDependenciesTemplateContextVars {
        return {
            configDependencies: pkg.getDependenciesFromConfigs(),
            configDevDependencies: pkg.getDevDependenciesFromConfigs(),
            dynamicDependencies: pkg.getDynamicDependencies(),
            dynamicDevDependencies: pkg.getDynamicDevDependencies()
        } as PackageDependenciesTemplateContextVars;
    }

    private getPackageScriptsContextVars(pkg: Package): PackageScriptsTemplateContextVars {
        return {
            configScripts: pkg.getScriptsFromConfigs(),
            dynamicScripts: pkg.getDynamicScripts()
        } as PackageScriptsTemplateContextVars;
    }

    private getPackageEnvVarsContextVars(pkg: Package): PackageEnvVarsTemplateContextVars {
        return {
            configEnvVars: pkg.getEnvVarsFromConfigs(),
            dynamicEnvVars: pkg.getDynamicEnvVars()
        } as PackageEnvVarsTemplateContextVars;
    }

    private getSelectedPackagesContextVars(
        configsManager: ConfigsManager
    ): SelectedPackagesTemplateContextVars {
        const selectedPackages = configsManager.getSelectedPackage();
        return {
            additionalPackages: selectedPackages
        } as SelectedPackagesTemplateContextVars;
    }

    createContextForFramework(
        configsManager: ConfigsManager,
        _frameworksManager: FrameworksManager,
        _packagesManager: PackagesManager,
        contextVars: Record<string, unknown> = {}
    ): FrameworkTemplateContext {
        return {
            app: this.getAppContextVars(configsManager),
            framework: this.getFrameworkContextVars(configsManager),
            dependencies: this.getAppDependenciesContextVars(configsManager),
            scripts: this.getAppScriptsContextVars(configsManager),
            envVars: this.getAppEnvVarsContextVars(configsManager),
            selectedPackages: this.getSelectedPackagesContextVars(configsManager),
            // generated by scripts context vars
            contextVars
        } as FrameworkTemplateContext;
    }

    createContextForPackage(
        pkg: Package,
        configsManager: ConfigsManager,
        _frameworksManager: FrameworksManager,
        _packagesManager: PackagesManager,
        contextVars: Record<string, unknown> = {}
    ): PackageTemplateContext {
        return {
            app: this.getAppContextVars(configsManager),
            framework: this.getFrameworkContextVars(configsManager),
            pkg: this.getPackageContextVars(pkg),
            dependencies: this.getPackageDependenciesContextVars(pkg),
            scripts: this.getPackageScriptsContextVars(pkg),
            envVars: this.getPackageEnvVarsContextVars(pkg),
            // generated by scripts context vars
            contextVars
        } as PackageTemplateContext;
    }

    async proccessTemplate(
        templateFullPath: string,
        context: FrameworkTemplateContext | PackageTemplateContext
    ): Promise<string> {
        const templateContent = await getFileContent(templateFullPath);
        const template = Handlebars.compile(templateContent);
        return template(context);
    }
}
