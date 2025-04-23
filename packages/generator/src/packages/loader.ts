import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import type { PackageConfig } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.join(__dirname);

logger.info(`Packages directory: ${packagesDir}`, { icon: '📦' });

/**
 * Validates if a module exports a valid package config
 */
function getPackageConfig(module: unknown): PackageConfig | null {
    if (!module || typeof module !== 'object') {
        return null;
    }
    const moduleKeys = Object.keys(module);
    const hasName = moduleKeys.includes('name');
    const hasDisplayName = moduleKeys.includes('displayName');
    const hasDescription = moduleKeys.includes('description');
    const hasVersion = moduleKeys.includes('version');
    if (hasName && hasDisplayName && hasDescription && hasVersion) {
        return module as PackageConfig;
    }
    return null;
}

/**
 * Dynamically loads framework packages from the filesystem
 * @returns Record of framework names and their packages
 */
export async function loadFrameworkPackages(): Promise<Record<string, PackageConfig[]>> {
    const frameworkPackages: Record<string, PackageConfig[]> = {};
    const frameworkDirs = ['react-vite', 'tanstack-start', 'astro-vite', 'hono'];

    logger.info('Loading framework packages...', { icon: '📦' });

    for (const dir of frameworkDirs) {
        try {
            const frameworkDir = path.join(packagesDir, `packages/${dir}`);

            try {
                await fs.access(frameworkDir);
            } catch {
                continue;
            }

            const entries = await fs.readdir(frameworkDir, { withFileTypes: true });
            const packages: PackageConfig[] = [];

            for (const entry of entries) {
                if (
                    !entry.isFile() ||
                    (!entry.name.endsWith('.ts') && !entry.name.endsWith('.js'))
                ) {
                    continue;
                }

                try {
                    const filePath = path.join(frameworkDir, entry.name);
                    const module = await import(filePath);

                    // Look for exports that match our package config pattern
                    for (const [key, value] of Object.entries(module)) {
                        if (key.toLowerCase().includes('package') && getPackageConfig(value)) {
                            packages.push(value as PackageConfig);
                        }
                    }
                } catch (error) {
                    logger.error(`Error loading package ${entry.name}:`, {
                        subtitle: String(error),
                    });
                }
            }

            if (packages.length > 0) {
                frameworkPackages[dir] = packages;
                logger.success(`Loaded ${packages.length} packages for ${dir}`);
            }
        } catch (error) {
            logger.error(`Error loading packages for ${dir}:`, { subtitle: String(error) });
        }
    }

    return frameworkPackages;
}

/**
 * Dynamically loads generic packages from the filesystem
 * @returns Array of generic packages
 */
export async function loadGenericPackages(): Promise<PackageConfig[]> {
    const genericPackages: PackageConfig[] = [];
    const genericDir = path.join(packagesDir, 'packages/generic');

    logger.info('Loading generic packages...', { icon: '📦' });

    try {
        await fs.access(genericDir);
        const entries = await fs.readdir(genericDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isFile() || (!entry.name.endsWith('.ts') && !entry.name.endsWith('.js'))) {
                continue;
            }

            try {
                const filePath = path.join(genericDir, entry.name);
                const module = await import(filePath);

                // Look for exports that match our package config pattern
                for (const [key, value] of Object.entries(module)) {
                    if (key.toLowerCase().includes('package') && getPackageConfig(value)) {
                        genericPackages.push(value as PackageConfig);
                    }
                }
            } catch (error) {
                logger.error(`Error loading generic package ${entry.name}:`, {
                    subtitle: String(error),
                });
            }
        }

        if (genericPackages.length > 0) {
            logger.success(`Loaded ${genericPackages.length} generic packages`);
        }
    } catch (error) {
        logger.error('Error loading generic packages:', { subtitle: String(error) });
        return [];
    }

    return genericPackages;
}
