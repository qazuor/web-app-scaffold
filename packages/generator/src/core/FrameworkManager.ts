import type { FrameworkOptions } from '../types/framework.js';
import type { ConfigsManager } from './ConfigsManager.js';

export class FrameworkManager {
    private config: ConfigsManager;
    private frameworks: FrameworkOptions[];

    constructor(config: ConfigsManager) {
        // this.steps = steps;
        // this.currentStep = 0;
        this.config = config;
        this.frameworks = [];
        this.initializeFrameworks();
    }

    private async initializeFrameworks(): Promise<void> {
        this.frameworks = await this.loadConfigs();
    }

    private async loadConfigs(): Promise<FrameworkOptions[]> {
        console.log('load frameworks');
        // Replace the following line with actual logic to load frameworks
        return Promise.resolve([]);
    }
}
