import type { QuestionCollection } from 'inquirer';
import type { Framework } from '../entity/Framework.js';
import { GeneratorError } from '../utils/error-handler.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class FrameworkPrompt extends BasePrompt {
    private availableFramworks!: Framework[];

    getPromptValues(): QuestionCollection {
        this.availableFramworks = this.getAvailableFramworks();
        return {
            type: 'list',
            name: 'framework',
            message: 'Which framework do you want to use?',
            choices: this.availableFramworks.map((framework: Framework) => ({
                name: framework.getDisplayName(),
                value: framework.getName()
            }))
        };
    }

    getAvailableFramworks(): Framework[] {
        if (!this.availableFramworks) {
            this.availableFramworks = this.frameworksManager.getFrameworks();
        }
        return this.availableFramworks;
    }

    /**
     * Validates framework selection
     * @throws {GeneratorError} If framework is invalid
     */
    public async validate(framework: string): Promise<true | string> {
        if (
            !this.getAvailableFramworks()
                .map((f: Framework) => f.getName())
                .includes(framework)
        ) {
            throw new GeneratorError(
                'Invalid framework',
                `Framework must be one of: ${this.getAvailableFramworks()
                    .map((f: Framework) => f.getName())
                    .join(', ')}`
            );
        }
        return true;
    }
}
