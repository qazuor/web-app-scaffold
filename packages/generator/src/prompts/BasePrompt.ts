import type { QuestionCollection } from 'inquirer';
import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';
import type { PackagesManager } from '../core/PackagesManager.js';

/**
 * Base class for prompt handlers
 */
export type validateValueType =
    | string
    | string[]
    | number
    | number[]
    | boolean
    | Record<string, string>;

export abstract class BasePrompt {
    protected configsManager: ConfigsManager;
    protected frameworksManager: FrameworksManager;
    protected packagesManager: PackagesManager;

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.packagesManager = packagesManager;
    }

    /**
     * Validates the input value
     * @param value - Value to validate
     */
    abstract validate(value: validateValueType): Promise<true | string>;

    /**
     * Gets the prompt configuration
     */
    abstract getPromptValues(): QuestionCollection;

    /**
     * Gets the prompt configuration
     */
    public getPrompt(): QuestionCollection {
        return {
            ...this.getPromptValues(),
            validate: (input: validateValueType) => this.validate(input)
        };
    }
}
