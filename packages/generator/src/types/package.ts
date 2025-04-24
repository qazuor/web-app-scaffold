/**
 * Configuration for a package in the generator
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

    /** Whether this package is a UI library */
    isUILibrary?: boolean;

    /** Whether this package is an icon library */
    isIconLibrary?: boolean;

    /** Whether this package can be installed as a shared package */
    canBeSharedPackage?: boolean;

    /** Template directory for shared package if supported */
    sharedPackageTemplate?: string;

    /** Default name for the shared package */
    defaultSharedName?: string;

    /** Configuration files that need to be created or modified */
    configFiles?: {
        /** Path to the file relative to the app root */
        path: string;
        /** Content of the file or a function that returns the content */
        content: string | ((appName: string, port: number) => string);
        /** Whether to append to an existing file instead of creating/overwriting */
        append?: boolean;
    }[];

    /** Environment variables to add */
    envVars?: Record<string, string>;

    /** Scripts to add */
    scripts?: Record<string, string>;

    /** Configuration options for packages */
    configOptions?: {
        prompt?: {
            type: 'list';
            message: string;
            choices: Array<{
                name: string;
                value: string;
            }>;
            default?: string;
        };
        resultForPrompt?: Record<
            string,
            {
                dependencies?: string[];
                devDependencies?: string[];
                scripts?: Record<string, string>;
                contextPackageVars?: Record<string, Record<string, string>>;
            }
        >;
        result?: {
            dependencies?: string[];
            devDependencies?: string[];
            scripts?: Record<string, string>;
            contextPackageVars?: Record<string, Record<string, string>>;
        };
    };

    /** Selected configuration option */
    selectedConfig?: string;

    /** Installation type configuration if package is shared */
    installationType?: {
        isShared: boolean;
        packageName?: string;
    };

    /** Post-install commands to run */
    postInstall?: string[];

    /** README section to add for this package */
    readmeSection?: string | ((appName: string) => string);

    /** extra files contents for package */
    extraFilesContent?: Record<string, string>;
}
