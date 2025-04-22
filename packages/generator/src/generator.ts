import path from 'node:path';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import type { PackageConfig } from './packages/types.js';
import {
    promptForDescription,
    promptForFramework,
    promptForInstall,
    promptForName,
    promptForPackages,
    promptForPort,
} from './prompts.js';
import { installDependencies } from './utils/dependency-installer.js';
import {
    copyDirectory,
    copySharedConfig,
    createDirectory,
    createEnvFile,
    processDirectory,
    updateBiomeConfig,
    updatePackageJson,
    updatePortInConfigs,
} from './utils/file-operations.js';
import { logger } from './utils/logger.js';
import {
    createPackageConfigs,
    installSelectedPackages,
    updateEnvVars,
    updateReadme,
} from './utils/package-manager.js';
import { registerPort } from './utils/port-manager.js';

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
    // Show title
    logger.title('Qazuor App Generator for Turborepo', { icon: '🚀' });

    try {
        // Prompt the user for required information
        const framework = await promptForFramework(options);
        const appName = await promptForName({ name: options.name }, framework);
        const description = await promptForDescription(options, framework, appName);
        const port = await promptForPort({ port: options.port });

        // Load packages - if this fails, it will throw an error
        const selectedPackages = await promptForPackages(framework);
        const shouldInstall = await promptForInstall(options);

        // Create the app
        await createApp(appName, framework, description, port, selectedPackages);
        logger.success(`App "${appName}" successfully created with ${framework}!`);

        // Install dependencies if requested
        if (shouldInstall) {
            const appDir = path.join(process.cwd(), 'apps', appName);
            const installed = await installDependencies(appDir);

            // Install selected packages if dependencies were installed successfully
            if (installed && selectedPackages.length > 0) {
                await installSelectedPackages(appDir, selectedPackages);

                // Create configuration files for selected packages
                await createPackageConfigs(appDir, selectedPackages, appName, port);

                // Update environment variables
                await updateEnvVars(appDir, selectedPackages);

                // Update README.md
                await updateReadme(appDir, selectedPackages, appName);
            }

            // Show next steps
            showNextSteps(appName, framework, installed, port, selectedPackages);
        } else {
            // Show next steps without installation
            showNextSteps(appName, framework, false, port, selectedPackages);
        }
    } catch (error) {
        logger.error('Failed to create the app:', { subtitle: String(error) });
        console.error(error);
        process.exit(1);
    }
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
): Promise<void> {
    const appDir = path.join(process.cwd(), 'apps', name);

    // Use the global templatesDir variable
    const templateDir = path.join(global.templatesDir, framework);

    // Check if template directory exists
    if (!fs.existsSync(templateDir)) {
        throw new Error(
            `Template directory for framework "${framework}" not found at ${templateDir}`,
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
                default: false,
            },
        ]);

        if (!overwrite) {
            logger.warn('Operation cancelled.', { icon: '🛑' });
            process.exit(0);
        }

        logger.warn(`Removing existing folder: ${chalk.cyan(`apps/${name}`)}`, { icon: '🗑️' });
        await fs.remove(appDir);
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
        port,
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
        name: `@${name}/app`,
        description: description,
    });

    // Special instructions for TanStack Start
    if (framework === 'tanstack-start') {
        logger.info('Setting up TanStack Start...', {
            subtitle: 'TanStack Start requires specific dependencies to be installed.',
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
    selectedPackages: PackageConfig[],
): void {
    logger.subtitle('Next steps:', { icon: '👉' });
    console.log(`  1. Navigate to the app folder: ${chalk.cyan(`cd apps/${appName}`)}`);

    if (!dependenciesInstalled) {
        console.log(`  2. Install dependencies: ${chalk.cyan('pnpm install')}`);
        console.log(`  3. Start dev server: ${chalk.cyan('pnpm dev')}`);
    } else {
        console.log(`  2. Start dev server: ${chalk.cyan('pnpm dev')}`);
    }

    console.log(
        `  ${dependenciesInstalled ? 3 : 4}. Visit: ${chalk.cyan(`http://localhost:${port}`)}`,
    );

    if (framework === 'tanstack-start') {
        console.log(
            `  ${dependenciesInstalled ? 4 : 5}. Explore the API at: ${chalk.cyan(`http://localhost:${port}/api/hello`)}`,
        );

        logger.info('TanStack Start Notes:', {
            subtitle:
                '- TanStack Start is in beta and may have breaking changes\n' +
                '- The first run may take longer as it sets up the environment\n' +
                "- If you encounter issues, try running 'npx @tanstack/start@latest dev' directly",
            icon: 'ℹ️',
        });

        logger.info('For more information, see the TanStack Start documentation:', {
            subtitle: 'https://tanstack.com/start/latest',
            dontUseTitle: true,
            icon: '📚',
        });
    } else if (!dependenciesInstalled) {
        console.log(`  5. Run Biome linter: ${chalk.cyan('pnpm lint')}`);
        console.log(`  6. Format code with Biome: ${chalk.cyan('pnpm format')}`);
    }

    // Show information about selected packages
    if (selectedPackages.length > 0) {
        logger.info(`Installed ${selectedPackages.length} additional packages:`, {
            icon: '📦',
            subtitle: selectedPackages.map((pkg) => pkg.displayName).join(', '),
        });

        logger.info('Check the README.md file for documentation on how to use these packages.', {
            icon: '📖',
        });
    }
}
