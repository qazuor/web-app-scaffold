import type { QuestionCollection } from 'inquirer';
import type { Package } from '../entity/Package.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class AdditionalPackagesPrompt extends BasePrompt {
    private availablePackages!: Package[];

    getPromptValues(): QuestionCollection {
        this.availablePackages = this.packagesManager.getPackagesForFrameowrk(
            this.configsManager.getFrameworkName()
        );
        return {
            type: 'checkbox',
            name: 'selectedPackages',
            message: 'Select additional packages to install:',
            choices: this.availablePackages.map((pkg: Package) => ({
                name: pkg.getDisplayName(),
                value: pkg.getName()
            }))
        };
    }

    getDefaultValue(): string {
        return '';
    }

    /**
     * Validates framework selection
     * @throws {GeneratorError} If framework is invalid
     */
    public async validate(selectedPackages: string[]): Promise<true | string> {
        // Validate package compatibility
        for (const packageName of selectedPackages) {
            const pkg = this.availablePackages.find((p) => p.getName() === packageName);
            if (!pkg) {
                return `Package ${packageName} not found`;
            }
            if (
                pkg.getFrameworks().length > 0 &&
                !pkg.getFrameworks().includes(this.configsManager.getFrameworkName())
            ) {
                return `Package ${packageName} is not compatible with ${this.configsManager.getFrameworkName()}`;
            }
        }
        return true;
    }
}
