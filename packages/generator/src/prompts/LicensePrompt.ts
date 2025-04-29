import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application License prompts
 */
export class LicensePrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'list',
            name: 'license',
            message: 'License:',
            choices: [
                'MIT',
                'Apache-2.0',
                'GPL-3.0',
                'ISC',
                'Creative Commons',
                'Public Domain',
                'Proprietary',
                'Other'
            ],
            default: this.configsManager.getDefaultMetadata().license || 'MIT'
        };
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
