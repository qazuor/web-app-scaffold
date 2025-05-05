import type { QuestionCollection } from 'inquirer';
import { SharedPackageBasePrompt } from './SharedPackageBasePrompt.js';

/**
 * Handles already exist shared package
 */
export class UseAlreadyExistSharedPackagePrompt extends SharedPackageBasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'list',
            name: 'useAlreadyExistSharedPackage',
            message: `Package ${this.pkg.getDisplayName()} already has a shared package. Do you want to use it?`,
            choices: [
                {
                    name: 'Yes',
                    value: 'useAlreadyShared'
                },
                {
                    name: 'No, install a new one',
                    value: 'installNew'
                }
            ],
            default: 'useAlreadyShared'
        };
    }

    /**
     * Validates description
     */
    public async validate(): Promise<true> {
        return true;
    }
}
