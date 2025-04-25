import { logger } from '@repo/logger';

/**
 * Custom error class for generator-specific errors
 */
export class GeneratorError extends Error {
    constructor(
        message: string,
        public details?: string
    ) {
        super(message);
        this.name = 'GeneratorError';
    }
}

/**
 * Handles errors in a consistent way across the generator
 * @throws {Error} Always throws the error after logging
 */
export function handleError(error: unknown, context: string): void {
    if (error instanceof GeneratorError) {
        logger.error(error.message, { subtitle: error.details });
        logger.debug(error as Error);
    } else {
        logger.error(`Error in ${context}:`, { subtitle: String(error) });
    }
    throw error;
}

/**
 * Wraps an async function with consistent error handling
 * @throws {Error} Throws the original error after logging
 */
export async function withErrorHandling<T>(fn: () => Promise<T>, context: string): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        handleError(error, context);
        throw error;
    }
}
