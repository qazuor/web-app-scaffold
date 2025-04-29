import type { PackageOptions } from './index.js';
import type { MetadataOptions } from './metadata.js';

/**
 * Options for app generation
 */
export interface GeneratorOptions {
    /** Main templates path */
    templatesPath: string;
    /** Framework templates path */
    frameworksTemplatesPath: string;
    /** Packages templates path */
    packagesTmplatesPath: string;
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
    selectedPackages?: PackageOptions[];
}
