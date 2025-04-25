import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import fs from 'fs-extra';
import Handlebars from 'handlebars';

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
                default: false
            }
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
        title: 'TEMPLATE'
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
    updates: Record<string, unknown>
): Promise<void> {
    if (fs.existsSync(packageJsonPath)) {
        const relativePath = path.relative(process.cwd(), packageJsonPath);
        logger.file('Updating', relativePath, { icon: '📝' });
        const packageJson = await fs.readJson(packageJsonPath);
        // Apply updates
        Object.assign(packageJson, updates);
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
    }
}

/**
 * Recursively processes a directory, replacing placeholders in files
 * @param dirPath Path to the directory
 * @param appName Application name
 * @param framework Selected framework
 * @param description Application description
 * @param basePath Base path to calculate relative paths
 * @param port Port number
 */
export async function processDirectory(
    dirPath: string,
    appName: string,
    framework: string,
    description: string,
    basePath: string,
    port?: number
): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const relativePath = path.relative(basePath, dirPath);
    const displayPath = relativePath || './';

    logger.directory('Processing directory:', displayPath);

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativeFilePath = path.join(displayPath, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath, appName, framework, description, basePath, port);
        } else if (entry.isFile() && entry.name !== '.env.example.hbs') {
            await processFile(fullPath, relativeFilePath, appName, framework, description, port);
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
 * @param port Port number
 */
export async function processFile(
    filePath: string,
    relativeFilePath: string,
    appName: string,
    framework: string,
    description: string,
    port?: number
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

        // Replace port if provided
        if (port) {
            content = content.replace(/port:\s*3000/g, `port: ${port}`);
            content = content.replace(/PORT\s*\|\|\s*3000/g, `PORT || ${port}`);
            content = content.replace(/"port":\s*3000/g, `"port": ${port}`);
            content = content.replace(/port=3000/g, `port=${port}`);
            content = content.replace(/PORT=3000/g, `PORT=${port}`);
        }

        if (content !== (await fs.readFile(filePath, 'utf8'))) {
            logger.success(`Replacing placeholders in: ${chalk.cyan(relativeFilePath)}`, {
                icon: '✏️',
                title: 'UPDATED'
            });
        }

        await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
        logger.warn(`Could not process file: ${chalk.cyan(relativeFilePath)}`, {
            subtitle: 'This file will be copied as-is without processing'
        });
        logger.debug(error as Error);
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
                subtitle: 'You may need to manually update the extends path in biome.json'
            });
            logger.debug(error as Error);
        }
    }
}

/**
 * Updates configuration files to use the specified port
 * @param appDir Path to the app directory
 * @param framework Framework name
 * @param port Port number
 */
export async function updatePortInConfigs(
    appDir: string,
    framework: string,
    port: number
): Promise<void> {
    logger.info(`Setting port to ${port} in configuration files`, { icon: '🔌' });

    try {
        // Update different config files based on the framework
        switch (framework) {
            case 'hono':
                await updateHonoPort(appDir, port);
                break;
            case 'react-vite':
                await updateVitePort(appDir, port);
                break;
            case 'astro-vite':
                await updateAstroPort(appDir, port);
                break;
            case 'tanstack-start':
                await updateTanstackPort(appDir, port);
                break;
        }

        logger.success(`Port configuration updated to ${port}`);
    } catch (error) {
        logger.warn('Failed to update port in configuration files', {
            subtitle: 'You may need to manually update the port in the configuration files'
        });
        logger.debug(error as Error);
    }
}

/**
 * Updates the port in Hono configuration
 * @param appDir App directory
 * @param port Port number
 */
async function updateHonoPort(appDir: string, port: number): Promise<void> {
    const viteConfigPath = path.join(appDir, 'vite.config.ts');
    const indexPath = path.join(appDir, 'src', 'index.ts');

    if (await fs.pathExists(viteConfigPath)) {
        let content = await fs.readFile(viteConfigPath, 'utf8');
        content = content.replace(/port:\s*3000/g, `port: ${port}`);
        await fs.writeFile(viteConfigPath, content);
    }

    if (await fs.pathExists(indexPath)) {
        let content = await fs.readFile(indexPath, 'utf8');
        content = content.replace(/PORT\s*\|\|\s*3000/g, `PORT || ${port}`);
        await fs.writeFile(indexPath, content);
    }
}

/**
 * Updates the port in Vite configuration
 * @param appDir App directory
 * @param port Port number
 */
async function updateVitePort(appDir: string, port: number): Promise<void> {
    const viteConfigPath = path.join(appDir, 'vite.config.ts');

    if (await fs.pathExists(viteConfigPath)) {
        let content = await fs.readFile(viteConfigPath, 'utf8');
        content = content.replace(/port:\s*3000/g, `port: ${port}`);
        await fs.writeFile(viteConfigPath, content);
    }
}

/**
 * Updates the port in Astro configuration
 * @param appDir App directory
 * @param port Port number
 */
async function updateAstroPort(appDir: string, port: number): Promise<void> {
    const astroConfigPath = path.join(appDir, 'astro.config.mjs');

    if (await fs.pathExists(astroConfigPath)) {
        let content = await fs.readFile(astroConfigPath, 'utf8');
        content = content.replace(/port:\s*3000/g, `port: ${port}`);
        await fs.writeFile(astroConfigPath, content);
    }
}

/**
 * Updates the port in TanStack Start configuration
 * @param appDir App directory
 * @param port Port number
 */
async function updateTanstackPort(appDir: string, port: number): Promise<void> {
    const viteConfigPath = path.join(appDir, 'vite.config.ts');
    const tanstackConfigPath = path.join(appDir, 'tanstack.config.ts');

    if (await fs.pathExists(viteConfigPath)) {
        let content = await fs.readFile(viteConfigPath, 'utf8');
        content = content.replace(/port:\s*3000/g, `port: ${port}`);
        await fs.writeFile(viteConfigPath, content);
    }

    if (await fs.pathExists(tanstackConfigPath)) {
        let content = await fs.readFile(tanstackConfigPath, 'utf8');

        // Add port configuration if it doesn't exist
        if (!content.includes('port:')) {
            content = content.replace(
                /export default defineConfig\(\{/,
                `export default defineConfig({\n  server: {\n    port: ${port}\n  },`
            );
        } else {
            content = content.replace(/port:\s*\d+/g, `port: ${port}`);
        }

        await fs.writeFile(tanstackConfigPath, content);
    }
}

interface EnvTemplateContext {
    appName: string;
    framework: string;
    port: number;
    description: string;
}

/**
 * Process an environment template with the given context
 * @param template Template content
 * @param context Template context
 * @returns Processed template content
 */
async function processEnvTemplate(template: string, context: EnvTemplateContext): Promise<string> {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
}

/**
 * Creates a .env file with the port configuration based on the template's .env.example
 * @param appDir App directory
 * @param framework Framework name
 * @param port Port number
 * @param appName Application name
 * @param description Application description
 */
export async function createEnvFile(
    appDir: string,
    framework: string,
    port: number,
    appName: string,
    description: string
): Promise<void> {
    const envPath = path.join(appDir, '.env');
    const envExamplePath = path.join(appDir, '.env.example');
    const envExampleTemplatePath = path.join(appDir, '.env.example.hbs');
    logger.info('Creating .env file with port configuration', { icon: '📝' });

    try {
        // Check if .env.example exists
        if (await fs.pathExists(envExampleTemplatePath)) {
            const template = await fs.readFile(envExampleTemplatePath, 'utf8');
            const envContent: string = await processEnvTemplate(template, {
                appName,
                framework,
                port,
                description
            });

            // Write the .env file
            await fs.writeFile(envPath, envContent);
            // Write the .env.example file
            await fs.writeFile(envExamplePath, envContent);

            // remove the .env.example.hbs file
            await fs.remove(envExampleTemplatePath);

            logger.success('Environment files created based on template');
        } else {
            // Create a default .env file if no example exists
            const defaultEnvContent = `# ${framework} Application configuration for ${appName}
NODE_ENV=development
PORT=${port}
PORT={{port}}
APP_TITLE={{appName}}

# Add your environment variables below

`;
            await fs.writeFile(envPath, defaultEnvContent);
            await fs.writeFile(envExamplePath, defaultEnvContent);

            logger.success('Default environment files created');
        }
    } catch (error) {
        logger.warn('Failed to create environment files', {
            subtitle: 'You may need to manually create the .env file'
        });
        logger.debug(error as Error);
    }
}
