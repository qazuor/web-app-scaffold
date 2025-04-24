import * as childProcess from 'node:child_process';
import { logger } from '@repo/logger';
import { describe, expect, it, vi } from 'vitest';
import { installDependencies } from '../dependency-installer';

vi.mock('node:child_process', () => ({
    execSync: vi.fn()
}));
vi.mock('@repo/logger');

describe('Dependency Installer', () => {
    it('should install dependencies successfully', async () => {
        vi.mocked(childProcess.execSync).mockImplementation(() => Buffer.from(''));

        const result = await installDependencies('/test/app');

        expect(result).toBe(true);
        expect(logger.info).toHaveBeenCalledWith('Installing dependencies...', {
            icon: '📦',
            subtitle: 'This may take a few minutes'
        });
        expect(logger.success).toHaveBeenCalledWith('Dependencies installed successfully.');
    });

    it('should handle installation failures', async () => {
        vi.mocked(childProcess.execSync).mockImplementation(() => {
            throw new Error('Installation failed');
        });

        const result = await installDependencies('/test/app');

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith(
            'Failed to install dependencies:',
            expect.objectContaining({
                subtitle: expect.stringContaining('pnpm install')
            })
        );
    });
});
