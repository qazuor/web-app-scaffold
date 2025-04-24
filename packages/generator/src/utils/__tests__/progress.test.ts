import { describe, expect, it, vi } from 'vitest';
import { logger } from '../logger';
import { ProgressTracker, createAppGenerationTracker } from '../progress';

vi.mock('../logger', () => ({
    logger: {
        step: vi.fn(),
        success: vi.fn(),
    },
}));

describe('Progress Tracker', () => {
    it('should track progress through steps', () => {
        const steps = ['Step 1', 'Step 2', 'Step 3'];
        const tracker = new ProgressTracker(steps);

        tracker.nextStep('Details for step 1');
        expect(logger.step).toHaveBeenCalledWith('Step 1', {
            subtitle: 'Details for step 1',
            title: '[1/3]',
        });

        tracker.completeStep();
        expect(logger.success).toHaveBeenCalledWith('Completed: Step 1');
    });

    it('should create app generation tracker with correct steps', () => {
        const tracker = createAppGenerationTracker();
        tracker.nextStep();

        expect(logger.step).toHaveBeenCalledWith(
            'Configure application settings',
            expect.any(Object),
        );
    });
});
