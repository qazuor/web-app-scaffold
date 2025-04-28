import { logger } from '@repo/logger';

/**
 * Tracks progress through multi-step operations
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
    completeStep(isSkyped?: boolean, text?: string): void {
        if (isSkyped) {
            logger.success(`Step skipped: ${text || this.steps[this.currentStep - 1]}`);
            return;
        }
        logger.log('\n');
        logger.success(` ✓ Completed: ${this.steps[this.currentStep - 1]}`);
    }
}
