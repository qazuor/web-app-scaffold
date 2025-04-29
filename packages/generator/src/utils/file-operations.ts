import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import fs from 'fs-extra';
import type { ConfigFile } from '../types/config.js';

/**
 * Creates a folder and its parents if they do not exist
 */
export async function createDirectory(dirPath: string): Promise<void> {
    const relativePath = path.relative(process.cwd(), dirPath);
    logger.directory('Creating folder:', relativePath);
    await fs.ensureDir(dirPath);
}

/**
 * Copies a folder to a new location
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
 * Get all config.json files in a directory
 */
export async function findAllConfigJson<T = unknown>(
    searchInPath: string
): Promise<ConfigFile<T>[]> {
    const foundConfigs: ConfigFile<T>[] = [];
    async function recurse(currentPath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                await recurse(fullPath);
            } else if (entry.isFile() && entry.name === 'config.json') {
                const rawContent = await fs.readFile(fullPath, 'utf-8');
                try {
                    const parsedContent = JSON.parse(rawContent) as T;
                    foundConfigs.push({ path: fullPath, content: parsedContent });
                } catch (error) {
                    console.warn(`Error parsing JSON en ${fullPath}:`, error);
                }
            }
        }
    }
    await recurse(searchInPath);
    return foundConfigs;
}

// /**
//  * Updates a package.json file with new values
//  */
// export async function updatePackageJson(
//     packageJsonPath: string,
//     updates: Record<string, unknown>
// ): Promise<void> {
//     if (fs.existsSync(packageJsonPath)) {
//         const relativePath = path.relative(process.cwd(), packageJsonPath);
//         logger.file('Updating', relativePath, { icon: '📝' });
//         const packageJson = await fs.readJson(packageJsonPath);
//         Object.assign(packageJson, updates);
//         await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
//     }
// }

// /**
//  * Recursively processes a directory, replacing placeholders
//  */
// export async function processDirectory(
//     dirPath: string,
//     appName: string,
//     framework: string,
//     description: string,
//     basePath: string,
//     port?: number
// ): Promise<void> {
//     const entries = await fs.readdir(dirPath, { withFileTypes: true });
//     const relativePath = path.relative(basePath, dirPath);
//     const displayPath = relativePath || './';

//     logger.directory('Processing directory:', displayPath);

//     for (const entry of entries) {
//         const fullPath = path.join(dirPath, entry.name);
//         const relativeFilePath = path.join(displayPath, entry.name);

//         if (entry.isDirectory()) {
//             await processDirectory(fullPath, appName, framework, description, basePath, port);
//         } else if (entry.isFile() && entry.name !== '.env.example.hbs') {
//             await processFile(fullPath, relativeFilePath, appName, framework, description, port);
//         }
//     }
// }

// /**
//  * Processes a single file, replacing placeholders
//  */
// export async function processFile(
//     filePath: string,
//     relativeFilePath: string,
//     appName: string,
//     framework: string,
//     description: string,
//     port?: number
// ): Promise<void> {
//     try {
//         logger.file('Processing file:', relativeFilePath);

//         let content = await fs.readFile(filePath, 'utf8');

//         // Replace placeholders
//         content = content
//             .replace(/{{appName}}/g, appName)
//             .replace(/{{framework}}/g, framework)
//             .replace(/{{description}}/g, description);

//         // Replace port if provided
//         if (port) {
//             content = content
//                 .replace(/port:\s*3000/g, `port: ${port}`)
//                 .replace(/PORT\s*\|\|\s*3000/g, `PORT || ${port}`)
//                 .replace(/"port":\s*3000/g, `"port": ${port}`)
//                 .replace(/port=3000/g, `port=${port}`)
//                 .replace(/PORT=3000/g, `PORT=${port}`);
//         }

//         if (content !== (await fs.readFile(filePath, 'utf8'))) {
//             logger.success(`Replacing placeholders in: ${chalk.cyan(relativeFilePath)}`, {
//                 icon: '✏️',
//                 title: 'UPDATED'
//             });
//         }

//         await fs.writeFile(filePath, content, 'utf8');
//     } catch (error) {
//         logger.warn(`Could not process file: ${chalk.cyan(relativeFilePath)}`, {
//             subtitle: 'This file will be copied as-is without processing'
//         });
//         logger.debug(error as Error);
//     }
// }

// /**
//  * Creates a copy of the shared configuration in the app directory
//  */
// export async function copySharedConfig(appDir: string, configDir: string): Promise<void> {
//     const appConfigDir = path.join(appDir, 'config');
//     await createDirectory(appConfigDir);

//     const sourceBiomeConfig = path.join(configDir, 'biome.json');
//     const destBiomeConfig = path.join(appConfigDir, 'biome.json');

//     if (fs.existsSync(sourceBiomeConfig)) {
//         logger.info('Copying shared Biome configuration', { icon: '⚙️' });
//         await fs.copy(sourceBiomeConfig, destBiomeConfig);
//     }
// }

// /**
//  * Updates the Biome configuration to use the correct path
//  */
// export async function updateBiomeConfig(appDir: string): Promise<void> {
//     const biomeConfigPath = path.join(appDir, 'biome.json');

//     if (fs.existsSync(biomeConfigPath)) {
//         logger.info('Updating Biome configuration to use local path', { icon: '⚙️' });

//         try {
//             const biomeConfig = await fs.readJson(biomeConfigPath);

//             if (biomeConfig.extends && Array.isArray(biomeConfig.extends)) {
//                 biomeConfig.extends = biomeConfig.extends.map((ext: string) => {
//                     if (ext.includes('../../packages/config/biome.json')) {
//                         return './config/biome.json';
//                     }
//                     return ext;
//                 });

//                 await fs.writeJson(biomeConfigPath, biomeConfig, { spaces: 2 });
//                 logger.success('Biome configuration updated successfully');
//             }
//         } catch (error) {
//             logger.warn('Failed to update Biome configuration', {
//                 subtitle: 'You may need to manually update the extends path in biome.json'
//             });
//             logger.debug(error as Error);
//         }
//     }
// }

// /**
//  * Updates configuration files to use the specified port
//  */
// export async function updatePortInConfigs(
//     appDir: string,
//     framework: string,
//     port: number
// ): Promise<void> {
//     logger.info(`Setting port to ${port} in configuration files`, { icon: '🔌' });

//     try {
//         const configUpdaters = {
//             hono: updateHonoPort,
//             'react-vite': updateVitePort,
//             'astro-vite': updateAstroPort,
//             'tanstack-start': updateTanstackPort
//         };

//         const updateFn = configUpdaters[framework];
//         if (updateFn) {
//             await updateFn(appDir, port);
//             logger.success(`Port configuration updated to ${port}`);
//         }
//     } catch (error) {
//         logger.warn('Failed to update port in configuration files', {
//             subtitle: 'You may need to manually update the port in the configuration files'
//         });
//         logger.debug(error as Error);
//     }
// }

// async function updateHonoPort(appDir: string, port: number): Promise<void> {
//     const viteConfigPath = path.join(appDir, 'vite.config.ts');
//     const indexPath = path.join(appDir, 'src', 'index.ts');

//     if (await fs.pathExists(viteConfigPath)) {
//         let content = await fs.readFile(viteConfigPath, 'utf8');
//         content = content.replace(/port:\s*3000/g, `port: ${port}`);
//         await fs.writeFile(viteConfigPath, content);
//     }

//     if (await fs.pathExists(indexPath)) {
//         let content = await fs.readFile(indexPath, 'utf8');
//         content = content.replace(/PORT\s*\|\|\s*3000/g, `PORT || ${port}`);
//         await fs.writeFile(indexPath, content);
//     }
// }

// async function updateVitePort(appDir: string, port: number): Promise<void> {
//     const viteConfigPath = path.join(appDir, 'vite.config.ts');

//     if (await fs.pathExists(viteConfigPath)) {
//         let content = await fs.readFile(viteConfigPath, 'utf8');
//         content = content.replace(/port:\s*3000/g, `port: ${port}`);
//         await fs.writeFile(viteConfigPath, content);
//     }
// }

// async function updateAstroPort(appDir: string, port: number): Promise<void> {
//     const astroConfigPath = path.join(appDir, 'astro.config.mjs');

//     if (await fs.pathExists(astroConfigPath)) {
//         let content = await fs.readFile(astroConfigPath, 'utf8');
//         content = content.replace(/port:\s*3000/g, `port: ${port}`);
//         await fs.writeFile(astroConfigPath, content);
//     }
// }

// async function updateTanstackPort(appDir: string, port: number): Promise<void> {
//     const viteConfigPath = path.join(appDir, 'vite.config.ts');
//     const tanstackConfigPath = path.join(appDir, 'tanstack.config.ts');

//     if (await fs.pathExists(viteConfigPath)) {
//         let content = await fs.readFile(viteConfigPath, 'utf8');
//         content = content.replace(/port:\s*3000/g, `port: ${port}`);
//         await fs.writeFile(viteConfigPath, content);
//     }

//     if (await fs.pathExists(tanstackConfigPath)) {
//         let content = await fs.readFile(tanstackConfigPath, 'utf8');

//         if (!content.includes('port:')) {
//             content = content.replace(
//                 /export default defineConfig\(\{/,
//                 `export default defineConfig({\n  server: {\n    port: ${port}\n  },`
//             );
//         } else {
//             content = content.replace(/port:\s*\d+/g, `port: ${port}`);
//         }

//         await fs.writeFile(tanstackConfigPath, content);
//     }
// }
