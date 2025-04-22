import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageConfig } from './types.js';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine if we're running from compiled code
const isCompiledCode = __dirname.includes('dist');

// Determine the base directory for packages
const packagesBaseDir = isCompiledCode
    ? path.join(__dirname) // En código compilado, estamos ya en el directorio packages
    : path.join(__dirname); // En código fuente, estamos ya en el directorio packages

// Determine the generic packages directory
const genericPackagesDir = path.join(packagesBaseDir, 'packages/generic');

// Log paths for debugging
console.log('Current directory:', __dirname);
console.log('Is compiled code:', isCompiledCode);
console.log('Packages base directory:', packagesBaseDir);
console.log('Generic packages directory:', genericPackagesDir);

/**
 * Dynamically loads framework packages from the filesystem
 * @returns Record of framework names and their packages
 */
export async function loadFrameworkPackages(): Promise<Record<string, PackageConfig[]>> {
    const frameworkPackages: Record<string, PackageConfig[]> = {};
    const frameworkDirs = ['react-vite', 'tanstack-start', 'astro-vite', 'hono'];

    try {
        // For each known framework directory, try to load its packages
        for (const dir of frameworkDirs) {
            try {
                const frameworkDir = path.join(packagesBaseDir, dir);

                // Check if directory exists
                if (!fs.existsSync(frameworkDir)) {
                    console.log(`Framework directory not found: ${frameworkDir}`);
                    continue;
                }

                console.log(`Loading packages from framework directory: ${frameworkDir}`);

                // Try to import the index file
                const indexPath = path.join(frameworkDir, 'index.js');

                if (!fs.existsSync(indexPath)) {
                    console.log(`Index file not found: ${indexPath}`);
                    continue;
                }

                // Import the module using a relative path
                const relativePath = path.relative(__dirname, indexPath).replace(/\\/g, '/');
                const importPath = relativePath.startsWith('.')
                    ? relativePath
                    : `./${relativePath}`;

                console.log(`Importing from: ${importPath}`);
                const module = await import(importPath);

                // Find the packages array in the module
                const packagesKey = Object.keys(module).find((key) =>
                    key.toLowerCase().includes('packages'),
                );

                if (packagesKey && Array.isArray(module[packagesKey])) {
                    frameworkPackages[dir] = module[packagesKey];
                    console.log(`Loaded ${module[packagesKey].length} packages for ${dir}`);
                } else {
                    console.log(`No packages found for ${dir}`);
                }
            } catch (error) {
                console.error(`Error loading packages for ${dir}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading framework packages:', error);
    }

    // Fallback to hardcoded packages if none were loaded
    if (Object.keys(frameworkPackages).length === 0) {
        console.log('Using fallback hardcoded framework packages');

        // Import the hardcoded packages from utils/packages.ts
        try {
            const hardcodedPackagesModule = await import('../utils/packages.js');
            return hardcodedPackagesModule.frameworkPackages || {};
        } catch (error) {
            console.error('Failed to load fallback hardcoded packages:', error);
            return {};
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

    try {
        // Check if the generic directory exists
        if (!fs.existsSync(genericPackagesDir)) {
            console.log(`Generic packages directory not found: ${genericPackagesDir}`);

            // Fallback to hardcoded generic packages
            console.log('Using fallback hardcoded generic packages');

            try {
                const hardcodedPackagesModule = await import('../utils/packages.js');
                return hardcodedPackagesModule.genericPackages || [];
            } catch (error) {
                console.error('Failed to load fallback hardcoded packages:', error);
                return [];
            }
        }

        // Get all files in the generic directory
        const files = fs
            .readdirSync(genericPackagesDir)
            .filter((file) => file.endsWith('.js') && file !== 'index.js');

        console.log(`Found generic package files: ${files.join(', ')}`);

        // For each file, dynamically import it and get the package config
        for (const file of files) {
            try {
                // Get the base name without extension
                const baseName = path.basename(file, '.js');

                // Import the module using a relative path
                const filePath = path.join(genericPackagesDir, file);
                const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
                const importPath = relativePath.startsWith('.')
                    ? relativePath
                    : `./${relativePath}`;

                console.log(`Importing generic package from: ${importPath}`);
                const module = await import(importPath);

                // Find the package config export
                const packageKey = Object.keys(module).find((key) =>
                    key.toLowerCase().includes('package'),
                );

                if (packageKey && module[packageKey]) {
                    genericPackages.push(module[packageKey]);
                    console.log(`Loaded generic package: ${module[packageKey].name}`);
                } else {
                    console.log(`No package found in ${file}`);
                }
            } catch (error) {
                console.error(`Error loading generic package ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading generic packages:', error);
    }

    // Fallback to hardcoded generic packages if none were loaded
    if (genericPackages.length === 0) {
        console.log('Using fallback hardcoded generic packages');

        try {
            const hardcodedPackagesModule = await import('../utils/packages.js');
            return hardcodedPackagesModule.genericPackages || [];
        } catch (error) {
            console.error('Failed to load fallback hardcoded packages:', error);
            return [];
        }
    }

    return genericPackages;
}
