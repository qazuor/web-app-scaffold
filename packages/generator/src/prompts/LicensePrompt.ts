import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application License prompts
 */
export class LicensePrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'license',
            message: 'License:'
        });
    }

    getDefaultValue(): string {
        return this.configsManager.getDefaultMetadata().license || 'MIT';
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
