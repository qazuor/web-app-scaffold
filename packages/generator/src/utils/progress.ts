import { logger } from '@repo/logger';

/**
 * Progress tracker for multi-step operations
 */
export class ProgressTracker {
    private steps: string[];
    private currentStep: number;

    constructor(steps: string[]) {
        this.steps = steps;
        this.currentStep = 0;
    }

    /**
     * Start the next step
     */
    nextStep(details?: string): void {
        this.currentStep++;
        const prefix = `[${this.currentStep}/${this.steps.length}]`;
        logger.step(this.steps[this.currentStep - 1], {
            subtitle: details,
            title: prefix
        });
    }

    /**
     * Mark the current step as complete
     */
    completeStep(): void {
        logger.success(`Completed: ${this.steps[this.currentStep - 1]}`);
    }
}

/**
 * Create a new progress tracker for app generation
 */
export function createAppGenerationTracker(): ProgressTracker {
    return new ProgressTracker([
        'Configure application settings',
        'Select additional packages',
        'Create application structure',
        'Install dependencies',
        'Configure packages',
        'Finalize setup'
    ]);
}
