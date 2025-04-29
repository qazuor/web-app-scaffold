import type { QuestionCollection } from 'inquirer';
import type { Package } from '../entity/Package.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class IconLibraryPrompt extends BasePrompt {
    private availablePackages!: Package[];

    getPromptValues(): QuestionCollection {
        this.availablePackages = this.packagesManager.getIconLibraryPackages();
        return {
            type: 'list',
            name: 'iconLibraryPkgName',
            message: 'Which UI library would you like to use?',
            choices: this.availablePackages.map((pkg: Package) => ({
                name: pkg.getDisplayName(),
                value: pkg.getName()
            }))
        };
    }

    /**
     * Validates framework selection
     * @throws {GeneratorError} If framework is invalid
     */
    public async validate(packageName: string): Promise<true | string> {
        // Validate package compatibility
        const pkg = this.availablePackages.find((p) => p.getName() === packageName);
        if (!pkg) {
            return `Icon library '${packageName}' not found`;
        }
        if (!pkg.isIconLibrary()) {
            return `Icon library '${packageName}' is not a Icon library`;
        }
        if (
            pkg.getFrameworks() &&
            !pkg.getFrameworks().includes(this.configsManager.getFramework())
        ) {
            return `Icon library '${packageName}' is not compatible with ${this.configsManager.getFramework()}`;
        }
        return true;
    }
}
