import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Keywaords prompts
 */
export class OverwriteAppFolderPrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'list',
            name: 'overwrite',
            message: `An app named '${this.configsManager.getName()}' already exists. Do you want to overwrite it or choose a new name?`,
            choices: [
                {
                    name: 'Yes - overwrite',
                    value: 'overwrite'
                },
                {
                    name: 'No - exit',
                    value: 'exit'
                },
                {
                    name: 'Select new name',
                    value: 'new-name'
                }
            ],
            default: true
        };
    }

    /**
     * Validates description
     */
    public async validate(): Promise<true> {
        return true;
    }
}
