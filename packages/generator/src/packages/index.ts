import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import { loadFrameworkPackages, loadGenericPackages } from './loader.js';
import type { PackageConfig } from './types.js';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine if we're running from compiled code
const isCompiledCode = __dirname.includes('dist');

// Determine the base directory for packages
const packagesBaseDir = isCompiledCode
    ? path.join(__dirname) // In compiled code, we're in dist/packages
    : __dirname; // In source code, we're already in the packages directory

logger.info(`Packages base directory: ${packagesBaseDir}`, { icon: '📦' });

/**
 * Gets packages available for a specific framework
 * @param framework Framework name
 * @returns Array of package configurations
 */
export async function getPackagesForFramework(framework: string): Promise<PackageConfig[]> {
    try {
        logger.info(`Loading packages for framework: ${framework}`, { icon: '📦' });

        // Load all framework packages
        const allFrameworkPackages = await loadFrameworkPackages();
        const frameworkSpecificPackages = allFrameworkPackages[framework] || [];

        // Load generic packages
        const genericPackages = await loadGenericPackages();

        // Filter generic packages compatible with this framework
        const compatibleGenericPackages = genericPackages.filter((pkg) => {
            return !pkg.frameworks || pkg.frameworks.includes(framework);
        });

        const allPackages = [...compatibleGenericPackages, ...frameworkSpecificPackages];

        logger.success(`Loaded ${allPackages.length} packages for ${framework}`, {
            subtitle: `(${compatibleGenericPackages.length} generic, ${frameworkSpecificPackages.length} framework-specific)`,
        });

        return allPackages;
    } catch (error) {
        logger.error(`Failed to load packages for framework ${framework}:`, {
            subtitle: String(error),
        });
        return [];
    }
}

/**
 * Type guard to validate package configuration
 * @param config Configuration to validate
 * @returns true if config is valid PackageConfig
 */
function isValidPackageConfig(config: unknown): config is PackageConfig {
    if (!config || typeof config !== 'object') {
        return false;
    }

    const pkg = config as PackageConfig;
    return (
        typeof pkg.name === 'string' &&
        typeof pkg.displayName === 'string' &&
        typeof pkg.description === 'string' &&
        typeof pkg.version === 'string'
    );
}

// Export the types
export * from './types.js';
export * from './loader.js';
