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
        this.availableFramworks = this.frameworksManager.getFrameworks();
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

    /**
     * Validates framework selection
     * @throws {GeneratorError} If framework is invalid
     */
    public async validate(framework: string): Promise<true | string> {
        if (!this.availableFramworks.map((f: Framework) => f.getName()).includes(framework)) {
            throw new GeneratorError(
                'Invalid framework',
                `Framework must be one of: ${this.availableFramworks
                    .map((f: Framework) => f.getName())
                    .join(', ')}`
            );
        }
        return true;
    }
}
