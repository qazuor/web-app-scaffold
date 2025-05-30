import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Repository Url prompts
 */
export class RepositoryUrlPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'repositoryUrl',
            message: 'Repository URL:',
            default:
                this.configsManager.getDefaultMetadata().repository ||
                'https://github.com/username/repo'
        };
    }

    /**
     * Validates description
     */
    public async validate(url: string): Promise<true | string> {
        return await validate.url(url, false);
    }
}
