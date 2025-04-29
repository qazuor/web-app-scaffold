import path from 'node:path';
import fs from 'fs-extra';
import type { QuestionCollection } from 'inquirer';
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
        if (!name) {
            return 'Shared package name is required';
        }

        if (!/^[a-z0-9-]+$/.test(name)) {
            return 'Shared package name must contain only lowercase letters, numbers, and hyphens';
        }

        if (name.length < 2) {
            return 'Shared package name must be at least 2 characters long';
        }

        if (name.length > 214) {
            return 'Shared package name must be less than 214 characters';
        }

        // Check if directory already exists
        const sharedPackageDir = path.join(process.cwd(), 'packages', name);
        if (await fs.pathExists(sharedPackageDir)) {
            return `An Shared package named "${name}" already exists`;
        }

        return true;
    }
}
