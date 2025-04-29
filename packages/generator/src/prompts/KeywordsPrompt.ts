import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Keywaords prompts
 */
export class KeywordsPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'keywords',
            message: 'Keywords (comma-separated):'
        });
    }

    getDefaultValue(): string {
        return '';
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
