import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application name prompts
 */
export class AppNamePrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'appName',
            message: 'Application name:',
            default: this.configsManager.getFrameworkName()
                ? this.frameworksManager
                      .getFrameworkByName(this.configsManager.getFrameworkName())
                      .getDefaultAppName()
                : 'my-app'
        };
    }

    /**
     * Validates application name
     */
    public async validate(name: string): Promise<true | string> {
        return await validate.appName(name);
    }
}
