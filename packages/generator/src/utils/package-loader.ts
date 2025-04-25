import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import type { PackageConfig } from '../types/package.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.join(__dirname, 'templates/packages');

interface PackageFiles {
    config: PackageConfig;
    readmeContent?: string;
    envVars?: Record<string, string>;
    extraFilesContent?: Record<string, string>;
}

/**
 * Loads package files from a directory
 * @param packageDir Directory containing package files
 * @param packageName Name of the package
 * @returns Package files or null if invalid
 */
async function loadPackageFiles(
    packageDir: string,
    packageName: string
): Promise<PackageFiles | null> {
    try {
        const configFile = path.join(packageDir, 'config.json');
        const config = (await fs.readJson(configFile)) as PackageConfig;

        if (!config) {
            logger.error(`No config exported from ${configFile}`);
            return null;
        }

        // Load README content if exists
        let readmeContent: string | undefined;
        try {
            readmeContent = await fs.readFile(path.join(packageDir, 'README.md'), 'utf-8');
        } catch {
            logger.warn(`No README.md found for package ${packageName}`);
        }

        // Load environment variables if exists
        let envVars: Record<string, string> | undefined;
        try {
            const envContent = await fs.readFile(path.join(packageDir, '.env'), 'utf-8');
            const vars = Object.fromEntries(
                envContent
                    .split('\n')
                    .filter((line) => line && !line.startsWith('#'))
                    .map((line) => line.split('='))
            );
            if (Object.keys(vars).length > 0) {
                envVars = vars;
            }
        } catch {
            // No env file is ok
        }

        // Collect extra files recursively
        const excluded = new Set(['config.json', 'README.md', '.env']);
        const extraFilesContent: Record<string, string> = {};

        async function walk(dir: string, basePath = '') {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const relPath = path.join(basePath, entry.name);
                const absPath = path.join(dir, entry.name);

                if (excluded.has(relPath)) continue;

                if (entry.isDirectory()) {
                    await walk(absPath, relPath);
                } else {
                    try {
                        const content = await fs.readFile(absPath, 'utf-8');
                        extraFilesContent[relPath] = content;
                    } catch (_error) {
                        logger.warn(`Failed to read extra file: ${relPath}`);
                    }
                }
            }
        }

        await walk(packageDir);

        return {
            config,
            readmeContent,
            envVars,
            extraFilesContent
        };
    } catch (error) {
        logger.error(`Error loading package ${packageName}:`, {
            subtitle: String(error)
        });
        logger.debug(error as Error);
        return null;
    }
}

/**
 * Loads all package configurations from the packages directory
 */
export async function loadPackageConfigs(): Promise<PackageConfig[]> {
    try {
        const packages: PackageConfig[] = [];
        const entries = await fs.readdir(packagesDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }

            const packageDir = path.join(packagesDir, entry.name);
            const packageFiles = await loadPackageFiles(packageDir, entry.name);

            if (packageFiles) {
                packages.push({
                    name: packageFiles.config.name,
                    displayName: packageFiles.config.displayName,
                    description: packageFiles.config.description,
                    version: packageFiles.config.version,
                    isUILibrary: packageFiles.config.isUILibrary,
                    isIconLibrary: packageFiles.config.isIconLibrary,
                    isDev: packageFiles.config.isDev,
                    dependencies: packageFiles.config.dependencies,
                    devDependencies: packageFiles.config.devDependencies,
                    canBeSharedPackage: packageFiles.config.canBeSharedPackage,
                    sharedPackageDefaultName: packageFiles.config.sharedPackageDefaultName,
                    readmeSection: packageFiles.readmeContent,
                    envVars: packageFiles.envVars,
                    configOptions: packageFiles.config.configOptions,
                    extraFilesContent: packageFiles.extraFilesContent,
                    frameworks: packageFiles.config.frameworks
                });
            }
        }

        return packages;
    } catch (error) {
        logger.error('Failed to load package configurations:', {
            subtitle: String(error)
        });
        logger.debug(error as Error);
        return [];
    }
}
