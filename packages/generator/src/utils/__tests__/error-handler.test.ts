import { describe, expect, it, vi } from 'vitest';
import { GeneratorError, handleError, withErrorHandling } from '../error-handler';
import { logger } from '../logger';

vi.mock('../logger', () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe('Error Handler', () => {
    it('should handle GeneratorError with details', () => {
        const error = new GeneratorError('Test error', 'Error details');

        expect(() => handleError(error, 'test')).toThrow();
        expect(logger.error).toHaveBeenCalledWith('Test error', {
            subtitle: 'Error details',
        });
    });

    it('should handle unknown errors', () => {
        const error = new Error('Unknown error');

        expect(() => handleError(error, 'test')).toThrow();
        expect(logger.error).toHaveBeenCalledWith('Error in test:', {
            subtitle: 'Unknown error',
        });
    });

    it('should wrap async functions with error handling', async () => {
        const successFn = async () => 'success';
        const failFn = async () => {
            throw new Error('Test error');
        };

        const result = await withErrorHandling(successFn, 'success test');
        expect(result).toBe('success');

        await expect(withErrorHandling(failFn, 'fail test')).rejects.toThrow('Test error');
    });
});
