import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Homepage prompts
 */
export class HomepagePrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'homepage',
            message: 'Homepage URL:'
        });
    }

    getDefaultValue(): string {
        return (
            this.configsManager.getDefaultMetadata().homepage ||
            'https://github.com/username/repo#readme'
        );
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
