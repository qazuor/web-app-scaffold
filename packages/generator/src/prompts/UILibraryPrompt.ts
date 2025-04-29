import type { QuestionCollection } from 'inquirer';
import type { Package } from '../entity/Package.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class UILibraryPrompt extends BasePrompt {
    private availablePackages!: Package[];

    getPromptValues(): QuestionCollection {
        this.availablePackages = this.packagesManager.getUILibraryPackages();
        return {
            type: 'list',
            name: 'uiLibraryPkgName',
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
            return `UI Library '${packageName}' not found`;
        }
        if (!pkg.isUILibrary()) {
            return `UI Library ' ${packageName}' is not a UI library`;
        }
        if (
            pkg.getFrameworks() &&
            !pkg.getFrameworks().includes(this.configsManager.getFramework())
        ) {
            return `UI Library '${packageName}' is not compatible with ${this.configsManager.getFramework()}`;
        }
        return true;
    }
}
