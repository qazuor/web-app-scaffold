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
    isSharedPackageFile?: boolean;
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
                    isFolder: false,
                    isTemplate: ext === 'hbs',
                    isReadmeFile: lowerName.startsWith('readme.md'),
                    isEnvFile: lowerName === '.env' || lowerName.startsWith('.env.'),
                    isPackageJsonFile: lowerName.startsWith('package.json'),
                    isMainConfigFile: baseName === 'config.json',
                    isConfigFile: ext === 'json' || lowerName.includes('config'),
                    isSharedPackageFile: entry.parentPath.endsWith('sharedPackagesFiles')
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
                } as FolderItem);
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
