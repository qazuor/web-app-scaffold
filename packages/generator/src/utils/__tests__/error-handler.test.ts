import { logger } from '@repo/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneratorError, handleError, withErrorHandling } from '../error-handler';

vi.mock('@repo/logger', () => ({
    logger: {
        error: vi.fn()
    }
}));

describe('Error Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it('should handle GeneratorError with details', () => {
        const error = new GeneratorError('Test error', 'Error details');
        expect(() => handleError(error, 'test')).toThrow(error);

        expect(logger.error).toHaveBeenCalledWith('Test error', {
            subtitle: 'Error details'
        });
    });

    it('should handle unknown errors', () => {
        const error = new Error('Unknown error');
        expect(() => handleError(error, 'test')).toThrow(error);

        expect(logger.error).toHaveBeenCalledWith('Error in test:', {
            subtitle: `Error: ${error.message}`
        });
    });

    it('should wrap async functions with error handling', async () => {
        const successFn = async () => 'success';
        const failFn = async () => {
            throw new Error('Test error');
        };

        const result = await withErrorHandling(successFn, 'success test');
        expect(result).toBe('success');

        const error = new Error('Test error');
        await expect(withErrorHandling(failFn, 'fail test')).rejects.toThrow(error);

        expect(logger.error).toHaveBeenCalledWith('Error in fail test:', {
            subtitle: `Error: ${error.message}`
        });
    });
});
