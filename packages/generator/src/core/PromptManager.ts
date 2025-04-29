import inquirer from 'inquirer';
import { AppNamePrompt, FrameworkPrompt } from '../prompts/index.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';

/**
 * Manages user prompts and input validation
 */
export class PromptManager {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;

    private frameworkPrompt!: FrameworkPrompt;
    private appNamePrompt!: AppNamePrompt;

    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
    }

    /**
     * Initializes the prompt manager
     */
    public async initializePrompts(): Promise<void> {
        this.frameworkPrompt = new FrameworkPrompt(this.configsManager, this.frameworksManager);
        this.appNamePrompt = new AppNamePrompt(this.configsManager, this.frameworksManager);
    }

    /**
     * Prompts for framework selection
     * @returns Selected framework
     */
    public async promptForFramework(): Promise<string> {
        if (this.configsManager.getFramework()) {
            await this.frameworkPrompt.validate(this.configsManager.getFramework());
            return this.configsManager.getFramework();
        }

        const { framework } = await inquirer.prompt([this.frameworkPrompt.getPrompt()]);

        return framework;
    }

    /**
     * Prompts for app name
     * @returns Selected name string
     */
    public async promptForAppName(): Promise<string> {
        if (this.configsManager.getName()) {
            await this.appNamePrompt.validate(this.configsManager.getName());
            return this.configsManager.getName();
        }

        const { appName } = await inquirer.prompt([this.appNamePrompt.getPrompt()]);

        return appName;
    }
}
