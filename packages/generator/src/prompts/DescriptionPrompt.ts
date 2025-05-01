import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application description prompts
 */
export class DescriptionPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'description',
            message: 'Application description:',
            default: this.configsManager.getFrameworkName()
                ? this.frameworksManager
                      .getFrameworkByName(this.configsManager.getFrameworkName())
                      .getDefaultAppDescription()
                : 'My App description'
        };
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
