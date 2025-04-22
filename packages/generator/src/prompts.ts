import inquirer from 'inquirer';
import { type PackageConfig, getPackagesForFramework } from './packages/index.js';
import {
    availableFrameworks,
    getDefaultDescriptionForFramework,
    getDefaultNameForFramework,
} from './utils/defaults.js';
import { getNextAvailablePort, isPortInUse } from './utils/port-manager.js';

/**
 * Prompts the user to select the framework to use
 * @param options CLI options
 * @returns Selected framework
 */
export async function promptForFramework(options: { framework?: string }): Promise<string> {
    if (options.framework) {
        return options.framework;
    }

    const { framework } = await inquirer.prompt([
        {
            type: 'list',
            name: 'framework',
            message: 'Which framework do you want to use?',
            choices: availableFrameworks,
        },
    ]);

    return framework;
}

/**
 * Prompts the user to input the application name
 * @param options CLI options
 * @param framework Selected framework
 * @returns Application name
 */
export async function promptForName(
    options: { name?: string },
    framework: string,
): Promise<string> {
    if (options.name) {
        return options.name;
    }

    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Application name:',
            default: getDefaultNameForFramework(framework),
            validate: (input) => {
                if (/^[a-z0-9-]+$/.test(input)) return true;
                return 'Name must only contain lowercase letters, numbers and hyphens';
            },
        },
    ]);

    return name;
}

/**
 * Prompts the user to input the application description
 * @param options CLI options
 * @param framework Selected framework
 * @param appName Application name
 * @returns Application description
 */
export async function promptForDescription(
    options: { description?: string },
    framework: string,
    appName: string,
): Promise<string> {
    if (options.description) {
        return options.description;
    }

    const { description } = await inquirer.prompt([
        {
            type: 'input',
            name: 'description',
            message: 'Application description:',
            default: getDefaultDescriptionForFramework(framework, appName),
        },
    ]);

    return description;
}

/**
 * Prompts the user to input the port number
 * @param options CLI options
 * @returns Port number
 */
export async function promptForPort(options: { port?: number }): Promise<number> {
    if (options.port) {
        return options.port;
    }

    // Get the next available port as the default
    const nextPort = await getNextAvailablePort();

    const { port } = await inquirer.prompt([
        {
            type: 'input',
            name: 'port',
            message: 'Port number for the application:',
            default: nextPort.toString(),
            validate: async (input) => {
                const port = Number.parseInt(input, 10);

                if (Number.isNaN(port)) {
                    return 'Port must be a number';
                }

                if (port < 1024 || port > 65535) {
                    return 'Port must be between 1024 and 65535';
                }

                if (await isPortInUse(port)) {
                    return `Port ${port} is already in use by another app in this monorepo`;
                }

                return true;
            },
        },
    ]);

    return Number.parseInt(port, 10);
}

/**
 * Prompts the user to select packages to install
 * @param framework Selected framework
 * @returns Array of selected packages
 */
export async function promptForPackages(framework: string): Promise<PackageConfig[]> {
    try {
        const availablePackages = await getPackagesForFramework(framework);

        if (availablePackages.length === 0) {
            return [];
        }

        const { selectedPackageNames } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedPackageNames',
                message: 'Select packages to install:',
                choices: availablePackages.map((pkg) => ({
                    name: `${pkg.displayName} - ${pkg.description}`,
                    value: pkg.name,
                    checked: false,
                })),
            },
        ]);

        // Return the full package configs for selected packages
        return availablePackages.filter((pkg) => selectedPackageNames.includes(pkg.name));
    } catch (error) {
        console.error('Error loading packages:', error);
        throw new Error(
            `Failed to load packages for framework ${framework}. The generator will continue without additional packages.`,
        );
    }
}

/**
 * Prompts the user whether to install dependencies
 * @param options CLI options
 * @returns true if dependencies should be installed, false otherwise
 */
export async function promptForInstall(options: { install?: boolean }): Promise<boolean> {
    if (options.install !== undefined) {
        return options.install;
    }

    const { install } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'install',
            message: 'Do you want to automatically install dependencies after setup?',
            default: true,
        },
    ]);

    return install;
}

/**
 * Prompts the user to confirm overwriting an existing folder
 * @param dirPath Folder path
 * @returns true if folder should be overwritten, false otherwise
 */
export async function promptForOverwrite(dirPath: string): Promise<boolean> {
    const { overwrite } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'overwrite',
            message: `Folder ${dirPath} already exists. Do you want to overwrite it?`,
            default: false,
        },
    ]);

    return overwrite;
}
