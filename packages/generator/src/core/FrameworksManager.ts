import { Framework } from '../entity/Framework.js';
import type { ConfigFile } from '../types/config.js';
import type { FrameworkOptions } from '../types/framework.js';
import { findAllConfigJson } from '../utils/file-operations.js';
import type { ConfigsManager } from './ConfigsManager.js';

export class FrameworksManager {
    private config: ConfigsManager;
    private frameworks: Framework[];

    constructor(config: ConfigsManager) {
        this.config = config;
        this.frameworks = [];
    }

    public async initializeFrameworks(): Promise<void> {
        this.frameworks = await this.loadConfigs();
    }

    private async loadConfigs(): Promise<Framework[]> {
        const configs: ConfigFile[] = await findAllConfigJson(
            this.config.getFrameworksTemplatesPath()
        );
        return configs.map((config): Framework => {
            return new Framework(config.content as FrameworkOptions);
        });
    }

    public getFrameworks(): Framework[] {
        return this.frameworks;
    }

    public getFrameworkByName(name: string): Framework {
        const framework = this.frameworks.find((framework) => framework.getName() === name);
        if (!framework) {
            throw new Error(`Framework ${name} not found`);
        }
        return framework;
    }

    public getFrameworksWithUI(): Framework[] | [] {
        return this.frameworks.filter((framework) => framework.hasUI()) || [];
    }
}
