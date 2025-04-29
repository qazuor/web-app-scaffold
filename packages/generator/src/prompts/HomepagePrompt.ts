import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Homepage prompts
 */
export class HomepagePrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'homepage',
            message: 'Homepage URL:',
            default:
                this.configsManager.getDefaultMetadata().homepage ||
                'https://github.com/username/repo#readme'
        };
    }

    /**
     * Validates description
     */
    public async validate(url: string): Promise<true | string> {
        return await validate.url(url, false);
    }
}
