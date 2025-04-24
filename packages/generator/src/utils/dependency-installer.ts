import { execSync } from 'node:child_process';
import { logger } from '@repo/logger';

/**
 * Installs dependencies in the specified directory
 * @param dirPath Path to the directory where dependencies should be installed
 * @returns true if the installation was successful, false otherwise
 */
export async function installDependencies(dirPath: string): Promise<boolean> {
    logger.info('Installing dependencies...', {
        icon: '📦',
        subtitle: 'This may take a few minutes'
    });

    try {
        execSync('pnpm install', { cwd: dirPath, stdio: 'inherit' });
        logger.success('Dependencies installed successfully.');
        return true;
    } catch (error) {
        logger.error('Failed to install dependencies:', {
            subtitle: 'You can install them manually later with "pnpm install"'
        });
        console.error(error);
        return false;
    }
}
