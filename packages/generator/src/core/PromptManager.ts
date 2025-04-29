import inquirer from 'inquirer';
import { AppNamePrompt, DescriptionPrompt, FrameworkPrompt, PortPrompt } from '../prompts/index.js';
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
    private portPrompt!: PortPrompt;
    private descriptionPrompt!: DescriptionPrompt;

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
        this.portPrompt = new PortPrompt(this.configsManager, this.frameworksManager);
        this.descriptionPrompt = new DescriptionPrompt(this.configsManager, this.frameworksManager);
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

    /**
     * Prompts for app description
     * @returns Selected description string
     */
    public async promptForDescription(): Promise<string> {
        if (this.configsManager.getDescription()) {
            await this.descriptionPrompt.validate(this.configsManager.getDescription());
            return this.configsManager.getDescription();
        }

        const { description } = await inquirer.prompt([this.descriptionPrompt.getPrompt()]);

        return description;
    }

    /**
     * Prompts for app port
     * @returns Selected port number
     */
    public async promptForAppPort(): Promise<number> {
        if (this.configsManager.getPort()) {
            await this.portPrompt.validate(`${this.configsManager.getPort()}`);
            return this.configsManager.getPort();
        }

        const { port } = await inquirer.prompt([this.portPrompt.getPrompt()]);

        return Number.parseInt(port, 10);
    }
}
