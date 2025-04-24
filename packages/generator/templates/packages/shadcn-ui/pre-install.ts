import { execSync } from 'node:child_process';
import { logger } from '../../../src/utils/logger.js';

export async function preInstall(appDir: string): Promise<void> {
    try {
        execSync('pnpm dlx shadcn-ui@latest init --yes', { cwd: appDir, stdio: 'inherit' });
        logger.success('Initialized shadcn/ui');
    } catch (error) {
        logger.error('Failed to initialize shadcn/ui:', { subtitle: String(error) });
    }
}
