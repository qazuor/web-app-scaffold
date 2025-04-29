import { logger } from '@repo/logger';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public details?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

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
export function handleError(error: unknown, context: string): void {
    if (error instanceof ValidationError) {
        logger.error(error.message, {
            subtitle: error.details,
            icon: '❌'
        });
    } else if (error instanceof GeneratorError) {
        logger.error(error.message, { subtitle: error.details });
        // logger.debug(error as Error);
    } else {
        logger.error(`Error in ${context}:`, { subtitle: String(error) });
    }
}

/**
 * Wraps an async function with consistent error handling
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        handleError(error, context);
        return null;
        // throw error;
    }
}
