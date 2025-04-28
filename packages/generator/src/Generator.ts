import path from 'node:path';
import { logger } from '@repo/logger';
import { ProgressTracker } from './core/Progress.js';
import type { GeneratorOptions } from './types/generator.js';
import type { PackageConfig } from './types/package.js';
import { withErrorHandling } from './utils/error-handler.js';

/**
 * Core generator class that orchestrates the app generation process
 */
export class Generator {
    private templatesDir: string;
    private frameworkTemplatesDir: string;
    private packageTemplatesDir: string;
    private progress: ProgressTracker;

    constructor(templatesDir: string) {
        this.templatesDir = templatesDir;
        this.frameworkTemplatesDir = path.join(templatesDir, 'frameworks');
        this.packageTemplatesDir = path.join(templatesDir, 'packages');

        this.progress = new ProgressTracker([
            'Configure application settings',
            'Configure package metadata',
            'UI Library package',
            'Icon Library package',
            'Additional packages',
            'Installation type',
            'Create application structure',
            'Add additional packages',
            'Install dependencies',
            'Installation end'
        ]);
    }

    /**
     * Runs the app generation process
     * @param options - CLI options for app generation
     */
    public async run(options: GeneratorOptions): Promise<void> {
        await withErrorHandling(async () => {
            logger.title('Qazuor App Generator for Turborepo', {
                icon: '🚀'
            });

            // Step 1: Configure application settings
            this.progress.nextStep(
                'Configuring basic settings... (Name, Framework, description, port, etc.)'
            );
            this.progress.completeStep(false);

            // Step 2: Configure application settings
            this.progress.nextStep(
                'Configuring package metadata... (Autor, license, homepage, etc.)'
            );
            this.progress.completeStep(false);

            // Step 3: Configure application settings
            this.progress.nextStep('Configuring UI Library package...');
            this.progress.completeStep(false);

            // Step 4: Configure application settings
            this.progress.nextStep('Configuring Icon Library package...');
            this.progress.completeStep(false);

            // Step 5: Configure application settings
            this.progress.nextStep('Configuring additional packages..');
            this.progress.completeStep(false);

            // Step 6: Configure application settings
            this.progress.nextStep(
                'Configuring installation type... (Install dependencies or not)'
            );
            this.progress.completeStep(false);

            // Step 7: Configure application settings
            this.progress.nextStep('Creating application structure... (Copying files and folders)');
            this.progress.completeStep(false);

            // Step 8: Configure application settings
            this.progress.nextStep(
                'Adding additional packages... (Added dependencies, scripts, configs, etc.)'
            );
            this.progress.completeStep(false);

            // Step 9: Configure application settings
            this.progress.nextStep('Running package manager install');
            this.progress.completeStep(false);

            // Step 10: Configure application settings
            this.progress.nextStep('Installation end... (Finishing up)');
            this.progress.completeStep(false);

            // End of the progress
            this.showCompletionMessage(options, []);
        }, 'app generation');
    }

    private showCompletionMessage(config: GeneratorOptions, packages: PackageConfig[]): void {
        logger.log('\n\n-----------------------------------------------------\n\n');
        logger.success('Application generated successfully!', {
            subtitle: `Created ${config.framework} application: ${config.name}`
        });

        logger.info('Next steps:', {
            subtitle: [
                `1. cd apps/${config.name}`,
                '2. pnpm dev',
                `3. Open http://localhost:${config.port || 3000}`
            ].join('\n')
        });

        if (packages.length > 0) {
            logger.info('Installed packages:', {
                subtitle: packages.map((p) => p.name).join(', ')
            });
        }
    }
}
