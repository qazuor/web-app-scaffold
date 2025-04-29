import type { QuestionCollection } from 'inquirer';
import { SharedPackageBasePrompt } from './SharedPackageBasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class SharedPackageInstalationTypePrompt extends SharedPackageBasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'list',
            name: 'installationType',
            message: `How would you like to install '${this.pkg.getDisplayName()}'?`,
            choices: [
                { name: 'As a shared package in the monorepo', value: 'shared' },
                { name: 'Direct installation in the app', value: 'direct' }
            ],
            default: 'direct'
        };
    }

    public async validate(): Promise<true | string> {
        return true;
    }
}
