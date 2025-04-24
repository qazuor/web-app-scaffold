import inquirer from 'inquirer';
import type { PackageConfig } from './types/package.js';
import {
    availableFrameworks,
    getDefaultDescriptionForFramework,
    getDefaultNameForFramework
} from './utils/defaults.js';
import { loadPackageConfigs } from './utils/package-loader.js';
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
    framework: string
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
    appName: string
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
        const allPackages = await loadPackageConfigs();
        const availablePackages = allPackages
            .filter(
                (pkg) =>
                    !pkg.frameworks ||
                    pkg.frameworks.length === 0 ||
                    pkg.frameworks.includes(framework)
            )
            .filter((pkg) => !pkg.isUILibrary)
            .filter((pkg) => !pkg.isIconLibrary);

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
                    checked: false
                })),
            },
        ]);

        // Return the full package configs for selected packages
        const selectedPackages = availablePackages.filter((pkg) =>
            selectedPackageNames.includes(pkg.name)
        );

        // Process each selected package for additional configuration
        for (const pkg of selectedPackages) {
            // Handle configuration options and shared package installation
            if (pkg.configOptions) {
                pkg.selectedConfig = await promptForConfigOption(pkg);
            }
            if (pkg.canBeSharedPackage) {
                pkg.installationType = await promptForInstallationType(pkg);
            }
        }

        return selectedPackages;
    } catch (error) {
        console.error('Error loading packages:', error);
        throw new Error(
            `Failed to load packages for framework ${framework}. The generator will continue without additional packages.`
        );
    }
}

/**
 * Prompts the user to choose installation type for a package
 * @param pkg Package configuration
 * @returns Installation configuration
 */
export async function promptForInstallationType(pkg: PackageConfig): Promise<{
    isShared: boolean;
    packageName?: string;
}> {
    if (!pkg.canBeSharedPackage) {
        return { isShared: false };
    }

    const { installationType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'installationType',
            message: `How would you like to install ${pkg.displayName}?`,
            choices: [
                { name: 'Direct installation in the app', value: 'direct' },
                { name: 'As a shared package in the monorepo', value: 'shared' }
            ],
        },
    ]);

    if (installationType === 'direct') {
        return { isShared: false };
    }

    const { packageName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'packageName',
            message: 'Package name:',
            default: pkg.defaultSharedName || 'shared-package',
            validate: (input: string) => {
                if (/^[a-z0-9-]+$/.test(input)) {
                    return true;
                }
                return 'Package name must only contain lowercase letters, numbers and hyphens';
            },
        },
    ]);

    return { isShared: true, packageName };
}

async function promptForConfigOption(pkg: PackageConfig): Promise<string | undefined> {
    if (!pkg.configOptions || !pkg.configOptions.prompt) {
        return undefined;
    }

    const { option } = await inquirer.prompt([
        {
            type: pkg.configOptions.prompt.type,
            name: 'option',
            message: pkg.configOptions.prompt.message,
            choices: pkg.configOptions.prompt.choices,
        },
    ]);

    return option;
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
 * Prompts the user to select a UI library if using React
 * @param framework Selected framework
 * @returns Selected UI library configuration or null
 */
export async function promptForUILibrary(framework: string): Promise<PackageConfig | null> {
    if (!['react-vite', 'tanstack-start'].includes(framework)) {
        return null;
    }

    const allPackages = await loadPackageConfigs();
    const uiLibraries = allPackages.filter((pkg) => pkg.isUILibrary);

    const { uiLibrary } = await inquirer.prompt([
        {
            type: 'list',
            name: 'uiLibrary',
            message: 'Which UI library would you like to use?',
            choices: [
                ...uiLibraries.map((lib) => ({
                    name: `${lib.displayName} - ${lib.description}`,
                    value: lib
                })),
                { name: 'None', value: null }
            ],
        },
    ]);

    return uiLibrary;
}

/**
 * Prompts the user to select an icon library if using React
 * @param framework Selected framework
 * @returns Selected icon library configuration or null
 */
export async function promptForIconLibrary(framework: string): Promise<PackageConfig | null> {
    if (!['react-vite', 'tanstack-start'].includes(framework)) {
        return null;
    }

    const allPackages = await loadPackageConfigs();
    const iconLibraries = allPackages.filter((pkg) => pkg.isIconLibrary);

    const { iconLibrary } = await inquirer.prompt([
        {
            type: 'list',
            name: 'iconLibrary',
            message: 'Which icon library would you like to use?',
            choices: [
                ...iconLibraries.map((lib) => ({
                    name: `${lib.displayName} - ${lib.description}`,
                    value: lib
                })),
                { name: 'None', value: null }
            ],
        },
    ]);

    return iconLibrary;
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
