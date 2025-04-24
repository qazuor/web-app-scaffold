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
 */
export function handleError(error: unknown, context: string): never {
    if (error instanceof GeneratorError) {
        logger.error(error.message, { subtitle: error.details });
    } else {
        logger.error(`Error in ${context}:`, { subtitle: String(error) });
    }
    process.exit(1);
}

/**
 * Wraps an async function with consistent error handling
 */
export function withErrorHandling<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return fn().catch((error) => {
        handleError(error, context);
        throw error; // TypeScript needs this
    });
}
