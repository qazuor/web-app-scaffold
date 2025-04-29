import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Bugs url prompts
 */
export class BugsUrlPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'bugsUrl',
            message: 'Issues URL:'
        });
    }

    getDefaultValue(): string {
        return (
            this.configsManager.getDefaultMetadata().bugs ||
            'https://github.com/username/repo/issues'
        );
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
