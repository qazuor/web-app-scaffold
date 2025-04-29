import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { SharedPackageBasePrompt } from './SharedPackageBasePrompt.js';

/**
 * Handles application name prompts
 */
export class SharedPackageOverwriteFolderPrompt extends SharedPackageBasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'list',
            name: 'overwrite',
            message: `An shared package named '${this.pkg.getName()}' already exists. Do you want to overwrite it or choose a new name?`,
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
     * Validates application name
     */
    public async validate(name: string): Promise<true | string> {
        return await validate.packageName(name);
    }
}
