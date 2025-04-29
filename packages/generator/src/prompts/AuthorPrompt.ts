import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';
import { validate } from '../utils/validations.js';

/**
 * Handles application Author prompts
 */
export class AuthorPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'author',
            message: 'Author (format: Name <email> (url)):',
            default:
                this.configsManager.getDefaultMetadata().author ||
                'John Doe <john@example.com> (https://github.com/johndoe)'
        };
    }

    /**
     * Validates description
     */
    public async validate(author: string): Promise<true | string> {
        return await validate.author(author);
    }
}
