import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application Repository Url prompts
 */
export class RepositoryUrlPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'repositoryUrl',
            message: 'Repository URL:'
        });
    }

    getDefaultValue(): string {
        return (
            this.configsManager.getDefaultMetadata().repository ||
            'https://github.com/username/repo'
        );
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
