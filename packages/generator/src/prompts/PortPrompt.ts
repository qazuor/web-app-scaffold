import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import { isPortInUse } from '../utils/port-manager.js';
import { BasePrompt } from './BasePrompt.js';

/**
 * Handles port number prompts
 */
export class PortPrompt extends BasePrompt<string> {
    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        super(configsManager, frameworksManager, {
            type: 'input',
            name: 'port',
            message: 'Port number for the application:'
        });
    }

    getDefaultValue(): string {
        return `${this.configsManager.getNextAvailablePort()}`;
    }

    /**
     * Validates port number
     */
    public async validate(port: string): Promise<true | string> {
        const portNum = Number(port);

        if (Number.isNaN(portNum)) {
            return 'Port must be a number';
        }

        if (portNum < 1024 || portNum > 65535) {
            return 'Port must be between 1024 and 65535';
        }

        if (await isPortInUse(portNum)) {
            return `Port ${portNum} is already in use`;
        }

        return true;
    }
}
