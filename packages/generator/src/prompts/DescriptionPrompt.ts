import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles application description prompts
 */
export class DescriptionPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'description',
            message: 'Application description:'
        });
    }

    getDefaultValue(): string {
        return this.configsManager.getFramework()
            ? this.frameworksManager
                  .getFrameworkByName(this.configsManager.getFramework())
                  .getDefaultAppDescription()
            : 'My App description';
    }

    /**
     * Validates description
     */
    public async validate(_description: string): Promise<true> {
        return true;
    }
}
