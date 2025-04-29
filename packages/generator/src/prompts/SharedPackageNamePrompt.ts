import type { QuestionCollection } from 'inquirer';
import { validate } from '../utils/validations.js';
import { SharedPackageBasePrompt } from './SharedPackageBasePrompt.js';

/**
 * Handles application name prompts
 */
export class SharedPackageNamePrompt extends SharedPackageBasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'packageName',
            message: 'Shared package name:',
            default:
                this.pkg.getSharedPackageDefaultName() || this.pkg.getName() || 'shared-package'
        };
    }

    /**
     * Validates application name
     */
    public async validate(name: string): Promise<true | string> {
        return await validate.packageName(name);
    }
}
