import type { MetadataOptions } from './metadata.js';
import type { PackageConfig } from './package.js';

/**
 * Options for app generation
 */
export interface GeneratorOptions {
    /** Selected framework */
    framework: string;
    /** Application name */
    name: string;
    /** Application description */
    description: string;
    /** Port number */
    port: number;
    /** Application directory */
    appDir: string;
    /** Whether to install dependencies automatically */
    shouldInstall?: boolean;
    /** Package.json metadata info */
    metadata?: MetadataOptions;
    /** Selected packages to add */
    selectedPackages?: PackageConfig[];
}
