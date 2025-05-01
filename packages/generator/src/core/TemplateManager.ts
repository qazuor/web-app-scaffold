import Handlebars from 'handlebars';
import type { FrameworkTemplateContext } from '../types/framework.js';
import type { PackageTemplateContext } from '../types/index.js';
import { getFileContent } from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';

export class TemplateManager {
    constructor() {
        this.addHelpers();
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
        Handlebars.registerHelper('get', (json, pathString) => {
            if (typeof json !== 'object' || json === null) {
                return undefined;
            }
            const path = pathString.split('.');
            let result = json;
            for (const key of path) {
                if (result[key] === undefined) {
                    return undefined;
                }
                result = result[key];
            }
            return result;
        });
    }

    createContextForFramework(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        _packagesManager: PackagesManager,
        contextVars: Record<string, unknown> = {}
    ): FrameworkTemplateContext {
        return {
            appName: configsManager.getName(),
            appFramework: configsManager.getFramework(),
            appFrameworkDescription: frameworksManager
                .getFrameworkByName(configsManager.getFrameworkName())
                ?.getDescription(),
            contextVars: contextVars
        } as FrameworkTemplateContext;
    }

    createContextForPackage(): PackageTemplateContext {
        return {} as PackageTemplateContext;
    }

    async proccessTemplate(
        templateFullPath: string,
        context: FrameworkTemplateContext
    ): Promise<string> {
        const templateContent = await getFileContent(templateFullPath);
        const template = Handlebars.compile(templateContent);
        return template(context);
    }
}
