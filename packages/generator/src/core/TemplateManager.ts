import Handlebars from 'handlebars';
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
import type { PackageTemplateContext } from '../types/package.js';
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
                    ...this.getDependenciesString(dependencies?.templateAppDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicAppDependencies),
                    ...this.getDependenciesString(dependencies?.configPackagesDependencies),
                    ...this.getDependenciesString(dependencies?.templatePackagesDependencies),
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
                    ...this.getDependenciesString(dependencies?.templateAppDevDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicAppDevDependencies),
                    ...this.getDependenciesString(dependencies?.configPackagesDevDependencies),
                    ...this.getDependenciesString(dependencies?.templatePackagesDevDependencies),
                    ...this.getDependenciesString(dependencies?.dynamicPackagesDevDependencies)
                ];
                return new Handlebars.SafeString(allDependencies.join(',\n        '));
            }
        );
        Handlebars.registerHelper(
            'getScripts',
            (scripts: ScriptsTemplateContextVars): Handlebars.SafeString | null => {
                const allScripts = [
                    ...this.getScriptsString(scripts?.configAppScripts),
                    ...this.getScriptsString(scripts?.templateAppScripts),
                    ...this.getScriptsString(scripts?.dynamicAppScripts),
                    ...this.getScriptsString(scripts?.configPackagesScripts),
                    ...this.getScriptsString(scripts?.templatePackagesScripts),
                    ...this.getScriptsString(scripts?.dynamicPackagesScripts)
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
            templateAppDependencies: framework.getDependenciesFromTemplates(),
            templateAppDevDependencies: framework.getDevDependenciesFromTemplates(),
            dynamicAppDependencies: framework.getDynamicDependencies(),
            dynamicAppDevDependencies: framework.getDynamicDevDependencies(),
            configPackagesDependencies: framework.getPackageDependenciesFromConfigs(),
            configPackagesDevDependencies: framework.getPackageDevDependenciesFromConfigs(),
            templatePackagesDependencies: framework.getPackageDependenciesFromTemplates(),
            templatePackagesDevDependencies: framework.getPackageDevDependenciesFromTemplates(),
            dynamicPackagesDependencies: framework.getPackageDynamicDependencies(),
            dynamicPackagesDevDependencies: framework.getPackageDynamicDevDependencies()
        } as DependenciesTemplateContextVars;
    }

    private getAppScriptsContextVars(configsManager: ConfigsManager): ScriptsTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            configAppScripts: framework.getScriptsFromConfigs(),
            templateAppScripts: framework.getScriptsFromTemplates(),
            dynamicAppScripts: framework.getDynamicScripts(),
            configPackagesScripts: framework.getPackageScriptsFromConfigs(),
            templatePackagesScripts: framework.getPackageScriptsFromTemplates(),
            dynamicPackagesScripts: framework.getPackageDynamicScripts()
        } as ScriptsTemplateContextVars;
    }

    private getAppEnvVarsContextVars(
        configsManager: ConfigsManager
    ): AppEnvVarsTemplateContextVars {
        const framework = configsManager.getFramework();
        return {
            configAppEnvVars: framework.getEnvVarsFromConfigs(),
            templateAppEnvVars: framework.getEnvVarsFromTemplates(),
            dynamicAppEnvVars: framework.getDynamicEnvVars(),
            configPackagesEnvVars: framework.getPackagesDynamicEnvVars(),
            templatePackagesEnvVars: framework.getPackagesEnvVarsFromTemplates(),
            dynamicPackagesEnvVars: framework.getPackagesDynamicEnvVars()
        } as AppEnvVarsTemplateContextVars;
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

    createContextForPackage(): PackageTemplateContext {
        return {} as PackageTemplateContext;
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
