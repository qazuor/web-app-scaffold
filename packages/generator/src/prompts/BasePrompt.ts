import type { QuestionCollection } from 'inquirer';
import type { ConfigsManager } from '../core/ConfigsManager.js';
import type { FrameworksManager } from '../core/FrameworksManager.js';

/**
 * Base class for prompt handlers
 */
export abstract class BasePrompt<T> {
    protected configsManager: ConfigsManager;
    protected frameworksManager: FrameworksManager;
    protected question: QuestionCollection;

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        question: QuestionCollection
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.question = question;
    }

    /**
     * Validates the input value
     * @param value - Value to validate
     */
    abstract validate(value: T): Promise<true | string>;

    /**
     * Gets the default value for the prompt
     */
    abstract getDefaultValue(): T;

    /**
     * Gets the prompt configuration
     */
    public getPrompt(): QuestionCollection {
        return {
            ...this.question,
            default: this.getDefaultValue(),
            validate: (input: T) => this.validate(input)
        };
    }
}
