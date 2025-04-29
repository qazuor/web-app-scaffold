import { logger } from '@repo/logger';
import type { ConfigsManager } from './core/ConfigsManager.js';
import { FrameworksManager } from './core/FrameworksManager.js';
import { ProgressTracker } from './core/Progress.js';
import { PromptManager } from './core/PromptManager.js';
import type { PackageConfig } from './types/package.js';
import { getPackageMetadataDefaults } from './utils/defaults.js';
import { withErrorHandling } from './utils/error-handler.js';
import { getNextAvailablePort } from './utils/port-manager.js';

/**
 * Core generator class that orchestrates the app generation process
 */
export class Generator {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private progress: ProgressTracker;
    private promptManager: PromptManager;

    constructor(configsManager: ConfigsManager) {
        this.configsManager = configsManager;
        this.frameworksManager = new FrameworksManager(configsManager);
        this.promptManager = new PromptManager(configsManager, this.frameworksManager);
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
    public async run(): Promise<void> {
        await withErrorHandling(async () => {
            logger.title('Qazuor App Generator for Turborepo', {
                icon: '🚀'
            });

            await this.frameworksManager.initializeFrameworks();
            await this.promptManager.initializePrompts();
            this.configsManager.setDefaultMetadata(await getPackageMetadataDefaults());
            this.configsManager.setNextAvailablePort(await getNextAvailablePort());

            // Step 1: Configure application settings
            this.progress.nextStep(
                'Configuring basic settings... (Name, Framework, description, port, etc.)'
            );
            const { framwork, name, description, port } =
                await this.configsManager.gatherConfiguration(this.promptManager);

            console.log('Framework:', framwork);
            console.log('App name:', name);
            console.log('Description:', description);
            console.log('Port:', port);

            this.progress.completeStep();

            // Step 2: Configure application settings
            // this.progress.nextStep(
            //     'Configuring package metadata... (Autor, license, homepage, etc.)'
            // );
            // this.progress.completeStep(false);

            // // Step 3: Configure application settings
            // this.progress.nextStep('Configuring UI Library package...');
            // this.progress.completeStep(false);

            // // Step 4: Configure application settings
            // this.progress.nextStep('Configuring Icon Library package...');
            // this.progress.completeStep(false);

            // // Step 5: Configure application settings
            // this.progress.nextStep('Configuring additional packages..');
            // this.progress.completeStep(false);

            // // Step 6: Configure application settings
            // this.progress.nextStep(
            //     'Configuring installation type... (Install dependencies or not)'
            // );
            // this.progress.completeStep(false);

            // // Step 7: Configure application settings
            // this.progress.nextStep('Creating application structure... (Copying files and folders)');
            // this.progress.completeStep(false);

            // // Step 8: Configure application settings
            // this.progress.nextStep(
            //     'Adding additional packages... (Added dependencies, scripts, configs, etc.)'
            // );
            // this.progress.completeStep(false);

            // // Step 9: Configure application settings
            // this.progress.nextStep('Running package manager install');
            // this.progress.completeStep(false);

            // // Step 10: Configure application settings
            // this.progress.nextStep('Installation end... (Finishing up)');
            // this.progress.completeStep(false);

            // // End of the progress
            // this.showCompletionMessage([]);
        }, 'app generation');
    }

    private showCompletionMessage(packages: PackageConfig[]): void {
        logger.log('\n\n-----------------------------------------------------\n\n');
        logger.success('Application generated successfully!', {
            subtitle: `Created ${this.configsManager.getFramework()} application: ${this.configsManager.getName()}`
        });

        logger.info('Next steps:', {
            subtitle: [
                `1. cd apps/${this.configsManager.getName()}`,
                '2. pnpm dev',
                `3. Open http://localhost:${this.configsManager.getPort()}`
            ].join('\n')
        });

        if (packages.length > 0) {
            logger.info('Installed packages:', {
                subtitle: packages.map((p) => p.name).join(', ')
            });
        }
    }
}
