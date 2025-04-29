import type { QuestionCollection } from 'inquirer';
import { SharedPackageBasePrompt } from './SharedPackageBasePrompt.js';

/**
 * Handles application description prompts
 */
export class SharedPackageDescriptionPrompt extends SharedPackageBasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'packageDescription',
            message: 'Shared package description:',
            default:
                this.pkg.getSharedPackageDefaultDescription() ||
                this.pkg.getDescription() ||
                'shared-package description'
        };
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
