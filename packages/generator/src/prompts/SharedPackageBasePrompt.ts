import type { QuestionCollection } from 'inquirer';
import type { Package } from '../entity/Package.js';
import { BasePrompt, type validateValueType } from './BasePrompt.js';

export abstract class SharedPackageBasePrompt extends BasePrompt {
    protected pkg!: Package;
    /**
     * Gets the prompt configuration
     */
    public getSharedPrompt(pkg: Package): QuestionCollection {
        this.pkg = pkg;
        return {
            ...this.getPromptValues(),
            validate: (input: validateValueType) => this.validate(input)
        };
    }
}
