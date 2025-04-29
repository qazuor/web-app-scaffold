import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import type { Framework } from '../entity/Framework.js';
import { GeneratorError } from '../utils/error-handler.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles framework selection prompts
 */
export class FrameworkPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        const availableFramworks = frameworksManager
            .getFrameworks()
            .map((framework: Framework) => ({
                name: framework.getDisplayName(),
                value: framework.getName()
            }));
        super(configsManager, frameworksManager, {
            type: 'list',
            name: 'framework',
            message: 'Which framework do you want to use?',
            choices: availableFramworks
        });
    }

    getDefaultValue(): string {
        return '';
    }

    /**
     * Validates framework selection
     * @throws {GeneratorError} If framework is invalid
     */
    public async validate(framework: string): Promise<true | string> {
        const validFrameworks = this.frameworksManager.getFrameworks();
        if (!validFrameworks.map((f: Framework) => f.getName()).includes(framework)) {
            throw new GeneratorError(
                'Invalid framework',
                `Framework must be one of: ${validFrameworks
                    .map((f: Framework) => f.getName())
                    .join(', ')}`
            );
        }
        return true;
    }
}
