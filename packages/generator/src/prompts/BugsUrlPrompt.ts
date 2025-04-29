import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Bugs url prompts
 */
export class BugsUrlPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'bugsUrl',
            message: 'Issues URL:',
            default:
                this.configsManager.getDefaultMetadata().bugs ||
                'https://github.com/username/repo/issues'
        };
    }

    /**
     * Validates description
     */
    public async validate(url: string): Promise<true | string> {
        return await validate.url(url, false);
    }
}
