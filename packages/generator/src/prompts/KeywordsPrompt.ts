import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Keywaords prompts
 */
export class KeywordsPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'keywords',
            message: 'Keywords (comma-separated):'
        };
    }

    /**
     * Validates description
     */
    public async validate(): Promise<true> {
        return true;
    }
}
