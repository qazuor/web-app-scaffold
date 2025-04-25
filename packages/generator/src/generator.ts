import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import type { KeyDescriptor } from 'inquirer-press-to-continue';
import PressToContinuePrompt from 'inquirer-press-to-continue';
import {
    promptForDescription,
    promptForFramework,
    promptForIconLibrary,
    promptForInstall,
    promptForMetadata,
    promptForName,
    promptForPackages,
    promptForPort,
    promptForUILibrary
} from './prompts.js';
import type { PackageConfig } from './types/package.js';
import { installDependencies } from './utils/dependency-installer.js';
import { withErrorHandling } from './utils/error-handler.js';
import {
    copyDirectory,
    copySharedConfig,
    createDirectory,
    createEnvFile,
    processDirectory,
    updateBiomeConfig,
    updatePackageJson,
    updatePortInConfigs
} from './utils/file-operations.js';
import { addSelectedPackages, updateEnvVars } from './utils/package-manager.js';
import { updateReadme } from './utils/package-manager copy.js';
import { registerPort } from './utils/port-manager.js';

inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);

// Declare global variable for templates directory
declare global {
    var templatesDir: string;
}

/**
 * Runs the app generator
 * @param options CLI options
 */
interface GeneratorOptions {
    framework?: string;
    name?: string;
    description?: string;
    port?: number;
    install?: boolean;
}

/**
 * Main function to run the generator
 * @param options CLI options
 */
export async function runGenerator(options: GeneratorOptions): Promise<void> {
    await withErrorHandling(async () => {
        logger.title('Qazuor App Generator for Turborepo', {
            icon: '🚀',
            subtitle: 'Creating a new application in your Turborepo monorepo'
        });

        // Prompt the user for required information
        logger.step('Configuring application settings...', {
            icon: '⚙️',
            subtitle: 'Framework, name, description, and port'
        });
        const framework = await promptForFramework(options);
        const appName = await promptForName({ name: options.name }, framework);
        const description = await promptForDescription(options, framework, appName);
        const port = await promptForPort({ port: options.port });

        // Get package metadata
        logger.step('Configuring package metadata...', {
            icon: '📝',
            subtitle: 'Author, license, repository, etc.'
        });
        const metadata = await promptForMetadata();

        // Load packages - if this fails, it will throw an error
        logger.step('Selecting additional packages...', {
            icon: '📦',
            subtitle: 'UI library, icon library, and other packages'
        });
        const uiLibrary = await promptForUILibrary(framework);
        const iconLibrary = await promptForIconLibrary(framework);
        const selectedPackages = await promptForPackages(framework);

        // Add UI and icon libraries to selected packages if chosen
        if (uiLibrary) {
            selectedPackages.push(uiLibrary);
        }
        if (iconLibrary) {
            selectedPackages.push(iconLibrary);
        }

        const shouldInstall = await promptForInstall(options);

        await inquirer.prompt<{ key: KeyDescriptor }>({
            name: 'key',
            type: 'press-to-continue',
            pressToContinueMessage: 'We are ready to install. Press Enter to continue...',
            enter: true
        });

        // Create the app
        logger.step(`Creating ${framework} application: ${appName}`, {
            icon: '🏗️',
            subtitle: `Port: ${port}\nDescription: ${description}`
        });
        await createApp(appName, framework, description, port, selectedPackages, metadata);

        const appDir = path.join(process.cwd(), 'apps', appName);

        // if has selected packages to install add it before run pnpm install
        if (selectedPackages.length > 0) {
            await addSelectedPackages(
                appDir,
                appName,
                framework,
                description,
                port,
                uiLibrary,
                iconLibrary,
                selectedPackages,
                metadata
            );

            // Update environment variables
            await updateEnvVars(appDir, selectedPackages);

            // Update README.md
            await updateReadme(appDir, selectedPackages, appName);
        }

        if (shouldInstall) {
            const installed = await installDependencies(appDir);
            showNextSteps(appName, framework, installed, port, selectedPackages);
        } else {
            showNextSteps(appName, framework, false, port, selectedPackages);
        }
    }, 'app generation');
}

/**
 * Creates a new application
 * @param name App name
 * @param framework Selected framework
 * @param description App description
 * @param port Port number
 * @param selectedPackages Selected packages
 */
async function createApp(
    name: string,
    framework: string,
    description: string,
    port: number,
    selectedPackages: PackageConfig[],
    metadata: Record<string, unknown>
): Promise<void> {
    const appDir = path.join(process.cwd(), 'apps', name);

    // Use the global templatesDir variable
    const templateDir = path.join(global.templatesDir, framework);

    // Check if template directory exists
    if (!fs.existsSync(templateDir)) {
        throw new Error(
            `Template directory for framework "${framework}" not found at ${templateDir}`
        );
    }

    const configDir = path.join(process.cwd(), 'packages', 'config');

    // Check if the directory already exists
    if (fs.existsSync(appDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `Folder apps/${name} already exists. Do you want to overwrite it?`,
                default: false
            }
        ]);

        if (!overwrite) {
            logger.warn('Operation cancelled.', { icon: '🛑' });
            process.exit(0);
        }

        logger.warn(`Removing existing folder: ${chalk.cyan(`apps/${name}`)}`, { icon: '🗑️' });
        await fs.remove(appDir);
    }

    // Check if the shared directory already exists
    for (const pkg of selectedPackages) {
        const sharedPackageName = pkg.installationType?.packageName;
        if (!sharedPackageName) {
            continue;
        }
        const sharedPackageDir = path.join(process.cwd(), 'packages', sharedPackageName);
        if (sharedPackageDir && fs.existsSync(sharedPackageDir)) {
            const { overwriteSharedPackage } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwriteSharedPackage',
                    message: `Folder packages/${sharedPackageName} already exists. Do you want to overwrite it?`,
                    default: false
                }
            ]);

            if (!overwriteSharedPackage) {
                logger.warn('Operation cancelled.', { icon: '🛑' });
                process.exit(0);
            }

            logger.warn(
                `Removing existing folder: ${chalk.cyan(`packages/${sharedPackageName}`)}`,
                {
                    icon: '🗑️'
                }
            );
            await fs.remove(sharedPackageDir);
        }
    }

    // Create the app folder
    await createDirectory(appDir);

    // Copy template files
    await copyDirectory(templateDir, appDir);

    // Process template files
    logger.info('Processing files...', { icon: '🔄' });
    await processDirectory(
        appDir,
        name,
        framework,
        description,
        path.join(process.cwd(), 'apps'),
        port
    );

    // Copy shared config files
    await copySharedConfig(appDir, configDir);

    // Update Biome configuration
    await updateBiomeConfig(appDir);

    // Update port in configuration files
    await updatePortInConfigs(appDir, framework, port);

    // Create .env file with port configuration based on template
    await createEnvFile(appDir, framework, port);

    // Register the port for this app
    await registerPort(name, port);

    // Update package.json
    const packageJsonPath = path.join(appDir, 'package.json');
    await updatePackageJson(packageJsonPath, {
        name: name,
        description: description,
        ...metadata
    });

    // Special instructions for TanStack Start
    if (framework === 'tanstack-start') {
        logger.info('Setting up TanStack Start...', {
            subtitle: 'TanStack Start requires specific dependencies to be installed.'
        });
    }
}

/**
 * Displays next steps for the user
 * @param appName Application name
 * @param framework Selected framework
 * @param dependenciesInstalled Whether dependencies were installed
 * @param port Port number
 * @param selectedPackages Selected packages
 */
function showNextSteps(
    appName: string,
    framework: string,
    dependenciesInstalled: boolean,
    port: number,
    selectedPackages: PackageConfig[]
): void {
    logger.subtitle('Next steps:', { icon: '👉' });
    logger.log(`  1. Navigate to the app folder: ${chalk.cyan(`cd apps/${appName}`)}`);

    if (!dependenciesInstalled) {
        logger.log(`  2. Install dependencies: ${chalk.cyan('pnpm install')}`);
        logger.log(`  3. Start dev server: ${chalk.cyan('pnpm dev')}`);
    } else {
        logger.log(`  2. Start dev server: ${chalk.cyan('pnpm dev')}`);
    }

    logger.log(
        `  ${dependenciesInstalled ? 3 : 4}. Visit: ${chalk.cyan(`http://localhost:${port}`)}`
    );

    if (framework === 'tanstack-start') {
        logger.log(
            `  ${dependenciesInstalled ? 4 : 5}. Explore the API at: ${chalk.cyan(`http://localhost:${port}/api/hello`)}`
        );

        logger.info('TanStack Start Notes:', {
            subtitle:
                '- TanStack Start is in beta and may have breaking changes\n' +
                '- The first run may take longer as it sets up the environment\n' +
                "- If you encounter issues, try running 'npx @tanstack/start@latest dev' directly",
            icon: 'ℹ️'
        });

        logger.info('For more information, see the TanStack Start documentation:', {
            subtitle: 'https://tanstack.com/start/latest',
            dontUseTitle: true,
            icon: '📚'
        });
    } else if (!dependenciesInstalled) {
        logger.log(`  5. Run Biome linter: ${chalk.cyan('pnpm lint')}`);
        logger.log(`  6. Format code with Biome: ${chalk.cyan('pnpm format')}`);
    }

    // Show information about selected packages
    if (selectedPackages.length > 0) {
        logger.info(`Installed ${selectedPackages.length} additional packages:`, {
            icon: '📦',
            subtitle: selectedPackages.map((pkg) => pkg.displayName).join(', ')
        });

        logger.info('Check the README.md file for documentation on how to use these packages.', {
            icon: '📖'
        });
    }
}
