import path from 'node:path';
import fs from 'fs-extra';
import type { QuestionCollection } from 'inquirer';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application name prompts
 */
export class AppNamePrompt extends BasePrompt {
    getPromptValues(): QuestionCollection {
        return {
            type: 'input',
            name: 'appName',
            message: 'Application name:',
            default: this.configsManager.getFramework()
                ? this.frameworksManager
                      .getFrameworkByName(this.configsManager.getFramework())
                      .getDefaultAppName()
                : 'my-app'
        };
    }

    /**
     * Validates application name
     */
    public async validate(name: string): Promise<true | string> {
        if (!name) {
            return 'Application name is required';
        }

        if (!/^[a-z0-9-]+$/.test(name)) {
            return 'Name must contain only lowercase letters, numbers, and hyphens';
        }

        if (name.length < 2) {
            return 'Name must be at least 2 characters long';
        }

        if (name.length > 214) {
            return 'Name must be less than 214 characters';
        }

        // Check if directory already exists
        const appDir = path.join(process.cwd(), 'apps', name);
        if (await fs.pathExists(appDir)) {
            return `An application named "${name}" already exists`;
        }

        return true;
    }
}
