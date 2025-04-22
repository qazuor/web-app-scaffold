import path from 'node:path';
import chalk from 'chalk';
import fs from 'fs-extra';
import { logger } from './logger.js';

/**
 * Checks if a folder exists and prompts the user to confirm overwriting it
 * @param dirPath Path to the folder
 * @param inquirer Inquirer instance
 * @returns true if it can proceed, false if operation should be canceled
 */
// biome-ignore lint/suspicious/noExplicitAny: external inquirer type
export async function checkAndConfirmOverwrite(dirPath: string, inquirer: any): Promise<boolean> {
    if (fs.existsSync(dirPath)) {
        const relativePath = path.relative(process.cwd(), dirPath);
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `Folder ${relativePath} already exists. Do you want to overwrite it?`,
                default: false,
            },
        ]);

        if (!overwrite) {
            logger.warn('Operation cancelled.', { icon: '🛑' });
            return false;
        }

        logger.warn(`Removing existing folder: ${chalk.cyan(relativePath)}`, { icon: '🗑️' });
        await fs.remove(dirPath);
    }
    return true;
}

/**
 * Creates a folder and its parents if they do not exist
 * @param dirPath Path to the folder
 */
export async function createDirectory(dirPath: string): Promise<void> {
    const relativePath = path.relative(process.cwd(), dirPath);
    logger.directory('Creating folder:', relativePath);
    await fs.ensureDir(dirPath);
}

/**
 * Copies a folder to a new location
 * @param sourcePath Source path
 * @param destPath Destination path
 */
export async function copyDirectory(sourcePath: string, destPath: string): Promise<void> {
    const sourceRelative = path.basename(sourcePath);
    const destRelative = path.relative(process.cwd(), destPath);
    logger.info(`Copying ${chalk.cyan(sourceRelative)} template to ${chalk.cyan(destRelative)}`, {
        icon: '📋',
        title: 'TEMPLATE',
    });
    await fs.copy(sourcePath, destPath);
}

/**
 * Updates a package.json file with new values
 * @param packageJsonPath Path to package.json
 * @param updates Object with updates to apply
 */
export async function updatePackageJson(
    packageJsonPath: string,
    updates: Record<string, unknown>,
): Promise<void> {
    if (fs.existsSync(packageJsonPath)) {
        const relativePath = path.relative(process.cwd(), packageJsonPath);
        logger.file('Updating', relativePath, { icon: '📝' });
        const packageJson = await fs.readJson(packageJsonPath);

        // Apply updates
        Object.assign(packageJson, updates);

        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
}

/**
 * Recursively processes a directory, replacing placeholders in files
 * @param dirPath Path to the directory
 * @param appName Application name
 * @param framework Selected framework
 * @param description Application description
 * @param basePath Base path to calculate relative paths
 */
export async function processDirectory(
    dirPath: string,
    appName: string,
    framework: string,
    description: string,
    basePath: string,
): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const relativePath = path.relative(basePath, dirPath);
    const displayPath = relativePath || './';

    logger.directory('Processing directory:', displayPath);

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativeFilePath = path.join(displayPath, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath, appName, framework, description, basePath);
        } else if (entry.isFile()) {
            await processFile(fullPath, relativeFilePath, appName, framework, description);
        }
    }
}

/**
 * Processes a single file, replacing placeholders
 * @param filePath Full path to the file
 * @param relativeFilePath Relative path to show in logs
 * @param appName Application name
 * @param framework Selected framework
 * @param description Application description
 */
export async function processFile(
    filePath: string,
    relativeFilePath: string,
    appName: string,
    framework: string,
    description: string,
): Promise<void> {
    try {
        logger.file('Processing file:', relativeFilePath);

        // Read the file content
        let content = await fs.readFile(filePath, 'utf8');

        // Replace placeholders
        content = content
            .replace(/{{appName}}/g, appName)
            .replace(/{{framework}}/g, framework)
            .replace(/{{description}}/g, description);

        if (content !== (await fs.readFile(filePath, 'utf8'))) {
            logger.success(`Replacing placeholders in: ${chalk.cyan(relativeFilePath)}`, {
                icon: '✏️',
                title: 'UPDATED',
            });
        }

        await fs.writeFile(filePath, content);
    } catch (error) {
        logger.warn(`Could not process file: ${chalk.cyan(relativeFilePath)}`, {
            subtitle: 'This file will be copied as-is without processing',
        });
    }
}

/**
 * Creates a copy of the shared configuration in the app directory
 * @param appDir Path to the app directory
 * @param configDir Path to the shared configuration directory
 */
export async function copySharedConfig(appDir: string, configDir: string): Promise<void> {
    const appConfigDir = path.join(appDir, 'config');

    // Create the config directory in the app
    await createDirectory(appConfigDir);

    // Copy the biome.json file from the shared config
    const sourceBiomeConfig = path.join(configDir, 'biome.json');
    const destBiomeConfig = path.join(appConfigDir, 'biome.json');

    if (fs.existsSync(sourceBiomeConfig)) {
        logger.info('Copying shared Biome configuration', { icon: '⚙️' });
        await fs.copy(sourceBiomeConfig, destBiomeConfig);
    }
}

/**
 * Updates the Biome configuration to use the correct path for extends
 * @param appDir Path to the app directory
 */
export async function updateBiomeConfig(appDir: string): Promise<void> {
    const biomeConfigPath = path.join(appDir, 'biome.json');

    if (fs.existsSync(biomeConfigPath)) {
        logger.info('Updating Biome configuration to use local path', { icon: '⚙️' });

        try {
            const biomeConfig = await fs.readJson(biomeConfigPath);

            // Update extends to use local path
            if (biomeConfig.extends && Array.isArray(biomeConfig.extends)) {
                biomeConfig.extends = biomeConfig.extends.map((ext: string) => {
                    if (ext.includes('../../packages/config/biome.json')) {
                        return './config/biome.json';
                    }
                    return ext;
                });

                await fs.writeJson(biomeConfigPath, biomeConfig, { spaces: 2 });
                logger.success('Biome configuration updated successfully');
            }
        } catch (error) {
            logger.warn('Failed to update Biome configuration', {
                subtitle: 'You may need to manually update the extends path in biome.json',
            });
        }
    }
}
