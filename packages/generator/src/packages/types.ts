/**
 * Interface for package configuration
 */
export interface PackageConfig {
    /** Package name as it appears in package.json */
    name: string;
    /** Display name for the package in the selection prompt */
    displayName: string;
    /** Short description of the package */
    description: string;
    /** Version of the package to install */
    version: string;
    /** Whether this is a dev dependency */
    isDev?: boolean;
    /** Additional dependencies that should be installed with this package */
    dependencies?: string[];
    /** Additional dev dependencies that should be installed with this package */
    devDependencies?: string[];
    /** Frameworks this package is compatible with (empty means all) */
    frameworks?: string[];
    /** Configuration files that need to be created or modified */
    configFiles?: {
        /** Path to the file relative to the app root */
        path: string;
        /** Content of the file or a function that returns the content */
        content: string | ((appName: string, port: number) => string);
        /** Whether to append to an existing file instead of creating/overwriting */
        append?: boolean;
    }[];
    /** README section to add for this package */
    readmeSection?: string | ((appName: string) => string);
    /** Environment variables to add */
    envVars?: Record<string, string>;
}
