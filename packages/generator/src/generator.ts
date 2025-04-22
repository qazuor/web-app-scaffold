import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import fs from 'fs-extra';
import {
    promptForDescription,
    promptForFramework,
    promptForInstall,
    promptForName,
    promptForOverwrite,
} from './prompts.js';
import { installDependencies } from './utils/dependency-installer.js';
import {
    copyDirectory,
    copySharedConfig,
    createDirectory,
    processDirectory,
    updateBiomeConfig,
    updatePackageJson,
} from './utils/file-operations.js';
import { logger } from './utils/logger.js';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runs the app generator
 * @param options CLI options
 */
interface GeneratorOptions {
    framework?: string;
    name?: string;
    description?: string;
    install?: boolean;
    overwrite?: boolean;
}

/**
 * Main function to run the generator
 * @param options CLI options
 */
export async function runGenerator(options: GeneratorOptions): Promise<void> {
    // Show title
    logger.title('Qazuor App Generator for Turborepo', { icon: '🚀' });

    // Prompt the user for required information
    const framework = await promptForFramework(options);
    const appName = await promptForName({ name: options.name }, framework);
    const description = await promptForDescription(options, framework, appName);
    const shouldInstall = await promptForInstall(options);

    // Create the app
    try {
        await createApp(appName, framework, description);
        logger.success(`App "${appName}" successfully created with ${framework}!`);

        // Install dependencies if requested
        if (shouldInstall) {
            const appDir = path.join(process.cwd(), 'apps', appName);
            const installed = await installDependencies(appDir);

            // Show next steps
            showNextSteps(appName, framework, installed);
        } else {
            // Show next steps without installation
            showNextSteps(appName, framework, false);
        }
    } catch (error) {
        logger.error('Failed to create the app:', { subtitle: 'See details below:' });
        console.error(error);
        process.exit(1);
    }
}

/**
 * Creates a new application
 * @param name App name
 * @param framework Selected framework
 * @param description App description
 */
async function createApp(name: string, framework: string, description: string): Promise<void> {
    const appDir = path.join(process.cwd(), 'apps', name);
    const templateDir = path.join(__dirname, '..', 'templates', framework);
    const configDir = path.join(process.cwd(), 'packages', 'config');

    // Check if the directory already exists
    if (fs.existsSync(appDir)) {
        const overwrite = await promptForOverwrite(`apps/${name}`);

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
    await processDirectory(appDir, name, framework, description, path.join(process.cwd(), 'apps'));

    // Copy shared config files
    await copySharedConfig(appDir, configDir);

    // Update Biome configuration
    await updateBiomeConfig(appDir);

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
 */
function showNextSteps(appName: string, framework: string, dependenciesInstalled: boolean): void {
    logger.subtitle('Next steps:', { icon: '👉' });
    console.log(`  1. Navigate to the app folder: ${chalk.cyan(`cd apps/${appName}`)}`);

    if (!dependenciesInstalled) {
        console.log(`  2. Install dependencies: ${chalk.cyan('pnpm install')}`);
        console.log(`  3. Start dev server: ${chalk.cyan('pnpm dev')}`);
    } else {
        console.log(`  2. Start dev server: ${chalk.cyan('pnpm dev')}`);
    }

    if (framework === 'tanstack-start') {
        console.log(
            `  ${dependenciesInstalled ? 3 : 4}. Visit: ${chalk.cyan('http://localhost:3000')}`,
        );
        console.log(
            `  ${dependenciesInstalled ? 4 : 5}. Explore the API at: ${chalk.cyan('http://localhost:3000/api/hello')}`,
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
        console.log(`  4. Run Biome linter: ${chalk.cyan('pnpm lint')}`);
        console.log(`  5. Format code with Biome: ${chalk.cyan('pnpm format')}`);
    }
}
