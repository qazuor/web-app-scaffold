import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '@repo/logger';
import { AppCreator } from './core/AppCreator.js';
import type { ConfigsManager } from './core/ConfigsManager.js';
import { FrameworksManager } from './core/FrameworksManager.js';
import { PackageLoader } from './core/PackageLoader.js';
import { PackagesManager } from './core/PackagesManager.js';
import { ProgressTracker } from './core/Progress.js';
import { PromptManager } from './core/PromptManager.js';
import { TemplateManager } from './core/TemplateManager.js';
import type { Package } from './entity/Package.js';
import { getNextAvailablePort } from './utils/creation-tracking.js';
import { getPackageMetadataDefaults } from './utils/defaults.js';
import { withErrorHandling } from './utils/error-handler.js';

const exec = promisify(execCb);
/**
 * Core generator class that orchestrates the app generation process
 */
export class Generator {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private progress: ProgressTracker;
    private promptManager: PromptManager;
    private packageLoader: PackageLoader;
    private packagesManager: PackagesManager;
    private AppCreator!: AppCreator;
    private templateManager: TemplateManager;

    constructor(configsManager: ConfigsManager) {
        this.configsManager = configsManager;
        this.frameworksManager = new FrameworksManager(this.configsManager);
        this.packagesManager = new PackagesManager(this.configsManager);
        this.promptManager = new PromptManager(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager
        );
        this.templateManager = new TemplateManager();
        this.packageLoader = new PackageLoader(
            this.configsManager,
            this.frameworksManager,
            this.packagesManager
        );
        this.progress = new ProgressTracker([
            'Configure application settings',
            'Configure package metadata',
            'UI Library package',
            'Icon Library package',
            'Additional packages',
            'Installation type',
            'All the information has been collected',
            'Create application structure',
            'Install dependencies',
            'Installation end'
        ]);
    }

    public async installDeps(): Promise<boolean> {
        try {
            const { stdout } = await exec('pnpm install', { cwd: process.cwd() });
            logger.log(`install deps stdout: ${stdout}`);
            return true;
        } catch (error) {
            logger.error(`Error executing pnpm install: ${(error as Error).message}`);
            return false;
        }
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

            let selectedPackages: Package[] = [];

            await this.frameworksManager.initializeFrameworks();
            await this.packagesManager.initializePackages();
            await this.promptManager.initializePrompts();
            this.configsManager.setDefaultMetadata(await getPackageMetadataDefaults());
            this.configsManager.setNextAvailablePort(await getNextAvailablePort());

            // Step 1: Configure application settings
            this.progress.nextStep(
                'Configuring basic settings... (Name, Framework, description, port, etc.)'
            );
            const { framwork } = await this.promptManager.gatherConfiguration();
            this.progress.completeStep();

            // Step 2: Configure package metadata
            this.progress.nextStep(
                'Configuring package metadata... (Autor, license, homepage, etc.)'
            );
            await this.promptManager.gatherMetadata();
            this.progress.completeStep();

            // Step 3: UI Library package
            const frameworkHasUI = this.frameworksManager
                .getFrameworkByName(this.configsManager.getFrameworkName())
                .hasUI();
            const frameworkHasUILibrary =
                this.packagesManager.getUILibraryPackages(this.configsManager.getFrameworkName())
                    .length > 0;
            this.progress.nextStep('Configuring UI Library package...');
            if (frameworkHasUI && frameworkHasUILibrary) {
                await this.promptManager.gatherUILibraryPackage();
            }
            this.progress.completeStep(
                !frameworkHasUI || !frameworkHasUILibrary,
                !frameworkHasUI
                    ? `UI Library is not supported in this framework: '${framwork}'`
                    : !frameworkHasUILibrary
                      ? `'${framwork}' frameowrk dont has any UI Library to add`
                      : undefined
            );

            // Step 4: Icon Library package
            const frameworkHasIconLibrary =
                this.packagesManager.getIconLibraryPackages(this.configsManager.getFrameworkName())
                    .length > 0;
            this.progress.nextStep('Configuring Icon Library package...');
            if (frameworkHasUI && frameworkHasIconLibrary) {
                await this.promptManager.gatherIconLibraryPackage();
            }
            this.progress.completeStep(
                !frameworkHasUI || !frameworkHasIconLibrary,
                !frameworkHasUI
                    ? `Icon Library is not supported in this framework: '${framwork}'`
                    : !frameworkHasIconLibrary
                      ? `'${framwork}' frameowrk dont has any Icon Library to add`
                      : undefined
            );

            // Step 5: Additional packages
            const frameworkHasAdditionalPackages =
                this.packagesManager.getPackagesForFrameowrk(this.configsManager.getFrameworkName())
                    .length > 0;
            this.progress.nextStep('Configuring additional packages..');
            if (frameworkHasAdditionalPackages) {
                selectedPackages = await this.promptManager.gatherAdditionalPackages();
            }

            const filteredSelectedPackages =
                selectedPackages?.filter((pkg) => !pkg.getUseAlreadyInstalledSharedPackage()) || [];

            if (filteredSelectedPackages.length) {
                await this.promptManager.gatherExtraOptionsForPackages(filteredSelectedPackages);
            }
            this.progress.completeStep(
                !frameworkHasAdditionalPackages,
                !frameworkHasAdditionalPackages
                    ? `Dont has Additional packages to install for '${framwork}' framework`
                    : undefined
            );

            // Step 6: Installation type
            this.progress.nextStep(
                'Configuring installation type... (Install dependencies or as shared package)'
            );
            const somePackageCanBeInstalledAsShared =
                this.packagesManager.getPackagesThatCanBeShared(
                    this.configsManager.getFrameworkName()
                ).length > 0;
            if (filteredSelectedPackages?.length && somePackageCanBeInstalledAsShared) {
                await this.promptManager.gatherInstallationInfoForPackages(
                    filteredSelectedPackages
                );
            }
            this.progress.completeStep(
                !filteredSelectedPackages?.length || !somePackageCanBeInstalledAsShared,
                !filteredSelectedPackages?.length
                    ? 'No additional package selected'
                    : !somePackageCanBeInstalledAsShared
                      ? 'None of the selected additional packages can be installed as a shared package'
                      : undefined
            );

            if (filteredSelectedPackages) {
                await this.packageLoader.updatePackages(filteredSelectedPackages);
            }

            this.progress.nextStep();
            const continueInstalation = await this.promptManager.allReadyPrompt();
            if (!continueInstalation) {
                logger.error('Installation cancelled by user');
                return;
            }
            this.progress.completeStep();

            // Step 7: Create application structure
            this.progress.nextStep('Creating application structure... (Copying files and folders)');
            this.AppCreator = new AppCreator(
                this.configsManager,
                this.frameworksManager,
                this.packagesManager,
                this.promptManager,
                this.templateManager
            );
            await this.AppCreator.createNewAppFileStructure();
            this.progress.completeStep();

            // Step 8: Install dependencies
            this.progress.nextStep('Running package manager install');
            const execPackagesInstall = await this.promptManager.execPnpmInstall();
            if (!execPackagesInstall) {
                logger.error('Installation cancelled by user');
                return;
            }
            const depsInstalation = await this.installDeps();
            if (!depsInstalation) {
                this.showCompletionMessage(selectedPackages, true);
                return;
            }
            this.progress.completeStep();

            // End of the progress
            this.showCompletionMessage(selectedPackages);
        }, 'app generation');
    }

    private showCompletionMessage(packages: Package[], pnpmInstallFail = false): void {
        logger.log('\n\n-----------------------------------------------------\n\n');
        logger.success('Application generated successfully!', {
            subtitle: `Created ${this.configsManager.getFrameworkName()} application: ${this.configsManager.getName()})`
        });
        if (pnpmInstallFail) {
            logger.error('Run pnpm install manually.', {
                subtitle: ['`pnpm install` to see what failed '].join('\n')
            });
        }
        logger.info('Next steps:', {
            subtitle: [
                `1. cd apps/${this.configsManager.getName()}`,
                '2. pnpm dev',
                `3. Open http://localhost:${this.configsManager.getPort()}`
            ].join('\n')
        });

        if (packages.length > 0) {
            logger.info('Installed packages:', {
                subtitle: packages.map((p) => `* ${p.getName()}`).join(',\n')
            });
        }
    }
}
