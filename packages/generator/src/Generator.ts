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
import type { SharedPackagesInfo } from './types/index.js';
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
            this.packagesManager,
            this.templateManager
        );
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
            await this.packagesManager.initializePackages();
            await this.promptManager.initializePrompts();
            this.configsManager.setDefaultMetadata(await getPackageMetadataDefaults());
            this.configsManager.setNextAvailablePort(await getNextAvailablePort());

            let iconLibraryPackage: Package | undefined = undefined;
            let uiLibraryPackage: Package | undefined = undefined;
            let selectedPackages: Package[] | undefined = undefined;
            let sharedPackagesInfo: SharedPackagesInfo[] | [] = [];

            // Step 1: Configure application settings
            this.progress.nextStep(
                'Configuring basic settings... (Name, Framework, description, port, etc.)'
            );
            const { framwork, name, description, port } =
                await this.promptManager.gatherConfiguration();
            this.progress.completeStep();

            // Step 2: Configure package metadata
            this.progress.nextStep(
                'Configuring package metadata... (Autor, license, homepage, etc.)'
            );
            const { author, homepage, bugsUrl, repositoryUrl, license, keywords } =
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
                uiLibraryPackage = await this.promptManager.gatherUILibraryPackage();
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
                iconLibraryPackage = await this.promptManager.gatherIconLibraryPackage();
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

            if (selectedPackages?.length) {
                await this.promptManager.gatherExtraOptionsForPackages(selectedPackages);
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
            if (selectedPackages?.length && somePackageCanBeInstalledAsShared) {
                sharedPackagesInfo =
                    await this.promptManager.gatherInstallationInfoForPackages(selectedPackages);
            }
            this.progress.completeStep(
                !selectedPackages?.length || !somePackageCanBeInstalledAsShared,
                !selectedPackages?.length
                    ? 'No additional package selected'
                    : !somePackageCanBeInstalledAsShared
                      ? 'None of the selected additional packages can be installed as a shared package'
                      : undefined
            );

            if (selectedPackages) {
                await this.packageLoader.updatePackages(selectedPackages);
            }

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

            // // Step 8: Add additional packages
            // this.progress.nextStep(
            //     'Adding additional packages... (Added dependencies, scripts, configs, etc.)'
            // );
            // this.progress.completeStep();

            // // Step 9: Install dependencies
            // this.progress.nextStep('Running package manager install');
            // this.progress.completeStep();

            // // Step 10: Installation end
            // this.progress.nextStep('Installation end... (Finishing up)');
            // this.progress.completeStep();

            // // End of the progress
            // this.showCompletionMessage([]);

            console.log('Framework:', framwork);
            console.log('App name:', name);
            console.log('Description:', description);
            console.log('Port:', port);
            console.log('author:', author);
            console.log('homepage:', homepage);
            console.log('bugs:', bugsUrl);
            console.log('repo:', repositoryUrl);
            console.log('license:', license);
            console.log('keywords:', keywords);
            console.log('uiLibraryPackage:', uiLibraryPackage);
            console.log('iconLibraryPackage:', iconLibraryPackage);
            console.log('selectedPackages:', selectedPackages);
            console.log('sharedPackagesInfo:', sharedPackagesInfo);
        }, 'app generation');

        console.log(this.configsManager);
    }

    private showCompletionMessage(packages: Package[]): void {
        logger.log('\n\n-----------------------------------------------------\n\n');
        logger.success('Application generated successfully!', {
            subtitle: `Created ${this.configsManager.getFrameworkName()} application: ${this.configsManager.getName()}`
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
                subtitle: packages.map((p) => p.getName()).join(', ')
            });
        }
    }
}
