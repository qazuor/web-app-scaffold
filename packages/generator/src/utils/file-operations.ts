import path from 'node:path';
import { logger } from '@repo/logger';
import chalk from 'chalk';
import fs from 'fs-extra';
import type { ConfigFile } from '../types/config.js';
import type { ScriptsObject } from '../types/index.js';

export interface FolderItem {
    fullPath: string;
    relativePath: string;
    isFolder?: boolean;
    fileType?: string;
    isTemplate?: boolean;
    isEnvFile?: boolean;
    isReadmeFile?: boolean;
    isPackageJsonFile?: boolean;
    isMainConfigFile?: boolean;
    isConfigFile?: boolean;
}

/**
 * Creates a folder and its parents if they do not exist
 */
export function getRelativePath(dirPath: string, from?: string): string {
    return path.relative(from || process.cwd(), dirPath);
}

/**
 * Creates a folder and its parents if they do not exist
 */
export async function createDirectory(dirPath: string): Promise<void> {
    const relativePath = getRelativePath(dirPath);
    logger.directory('Creating folder:', relativePath);
    await fs.ensureDir(dirPath);
}

/**
 * Copies a folder to a new location
 */
export async function copyDirectory(sourcePath: string, destPath: string): Promise<void> {
    const sourceRelative = getRelativePath(sourcePath);
    const destRelative = getRelativePath(destPath);
    logger.info(`Copying ${chalk.cyan(sourceRelative)} template to ${chalk.cyan(destRelative)}`, {
        icon: '📋',
        title: 'TEMPLATE'
    });
    await fs.copy(sourcePath, destPath);
}

/**
 * Checks if a folder exists at the given path
 */
export async function folderExists(dirPath: string): Promise<boolean> {
    const stats = await fs.stat(dirPath).catch(() => null);
    return !!stats?.isDirectory();
}

/**
 * Deletes the contents of a folder, but not the folder itself
 */
export async function deleteFolderContent(dirPath: string): Promise<void> {
    const exists = await folderExists(dirPath);
    if (!exists) return;

    const files = await fs.readdir(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        await fs.remove(fullPath);
    }

    logger.warn(`Deleted contents of ${getRelativePath(dirPath)}`);
}

/**
 * Deletes the folder and its contents
 */
export async function deleteFolder(dirPath: string): Promise<void> {
    await fs.remove(dirPath);
    logger.warn(`Deleted folder ${getRelativePath(dirPath)}`);
}

/**
 * Creates a file at the given path with optional initial content
 */
export async function createFile(fullPath: string, initialContent = ''): Promise<void> {
    await fs.ensureFile(fullPath);
    await fs.writeFile(fullPath, initialContent);
    logger.file(`Created file: ${getRelativePath(fullPath)}`, fullPath);
}

/**
 * Updates the content of an existing file
 */
export async function updateFileContent(fullPath: string, content: string): Promise<void> {
    await fs.writeFile(fullPath, content);
    logger.info(`Updated file: ${getRelativePath(fullPath)}`);
}

/**
 * Copies a file to a destination folder
 */
export async function copyFile(sourcePath: string, destFolderPath: string): Promise<void> {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(destFolderPath, fileName);
    await fs.copyFile(sourcePath, destPath);
    logger.info(
        `Copied ${chalk.cyan(getRelativePath(sourcePath))} to ${chalk.cyan(getRelativePath(destPath))}`
    );
}

/**
 * Reads the raw content of a file
 */
export async function getFileContent(filePath: string): Promise<string | null> {
    const exists = await fileExist(filePath);
    if (!exists) {
        throw new Error(`File not found: ${filePath}`);
    }

    const content = await fs.readFile(filePath, 'utf-8');
    logger.info(`Read file: ${getRelativePath(filePath)}`);
    return content;
}

/**
 * Check if file exixts
 */
export async function fileExist(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
}

/**
 * Reads and parses a JSON file
 */
export async function getJsonContent<T = unknown>(filePath: string): Promise<T> {
    const content = await getFileContent(filePath);

    try {
        return JSON.parse(content || '') as T;
    } catch (error) {
        throw new Error(`Failed to parse JSON in file: ${filePath}\n${(error as Error).message}`);
    }
}

/**
 * Gets the folder path of a full file path
 * @param fullPath Absolute path to a file
 * @returns Folder path containing the file (with trailing slash)
 */
export function getContainingFolder(fullPath: string): string {
    const dir = path.dirname(fullPath);
    return dir.endsWith(path.sep) ? dir : dir + path.sep;
}

/**
 * Recursively gets all contents of a folder with metadata
 */
export async function getFolderContent(dirPath: string): Promise<FolderItem[]> {
    const result: FolderItem[] = [];
    const filterFiles = ['config.json'];

    async function traverse(currentPath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                if (entry.name !== 'scripts') {
                    result.push({
                        fullPath,
                        relativePath: getRelativePath(fullPath, dirPath),
                        isFolder: true
                    });
                    await traverse(fullPath);
                }
            } else {
                if (filterFiles.includes(entry.name)) {
                    continue;
                }
                const ext = path.extname(entry.name).slice(1);
                const lowerName = entry.name.toLowerCase();
                const baseName = path.basename(entry.name);

                const metadata: Record<string, boolean> = {
                    isFolder: false, // esto ahora se filtra también
                    isTemplate: ext === 'hbs',
                    isReadmeFile: lowerName.startsWith('readme.md'),
                    isEnvFile: lowerName === '.env' || lowerName.startsWith('.env.'),
                    isPackageJsonFile: lowerName.startsWith('package.json'),
                    isMainConfigFile: baseName === 'config.json',
                    isConfigFile: ext === 'json' || lowerName.includes('config')
                };

                const flags = Object.entries(metadata).reduce<Record<string, true>>(
                    (acc, [key, value]) => {
                        if (value) acc[key] = true;
                        return acc;
                    },
                    {}
                );

                result.push({
                    fullPath: fullPath,
                    relativePath: getRelativePath(fullPath, dirPath),
                    fileType: ext || undefined,
                    ...flags
                });
            }
        }
    }

    await traverse(dirPath);
    return result;
}

/**
 * Recursively gets all scripts files of a app/package folder
 */
export async function getFolderScripts(dirPath: string): Promise<ScriptsObject> {
    const result: Record<string, string> = {};
    const entries = await fs.readdir(path.join(dirPath, 'scripts'), { withFileTypes: true });

    for (const entry of entries) {
        result[
            entry.name.replace('.ts', '').replace(/-([a-z])/g, (_, char) => char.toUpperCase())
        ] = entry.name;
    }
    return result;
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
