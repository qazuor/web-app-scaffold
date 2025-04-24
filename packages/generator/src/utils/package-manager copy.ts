import path from 'node:path';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import type { PackageJson } from 'type-fest';
import type { PackageConfig } from '../types/package.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);

/**
 * Process a Handlebars template with the given context
 */
interface TemplateContext {
    appName: string;
    config?: {
        db?: {
            provider: string;
            driver: string;
            connectionString?: string;
            url?: string;
        };
        uiLibrary?: string;
        iconLibrary?: string;
        useTailwind?: boolean;
        framework?: string;
    };
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
}

function processTemplate(content: string, context: TemplateContext): string {
    const template = Handlebars.compile(content);
    return template(context);
}

/**
 * Generate files from package template
 */
async function generateFullContextForTemplate(
    pkg: PackageConfig,
    targetDir: string,
    context: TemplateContext,
    selectedPackages: PackageConfig[],
) {
    // Get selected packages info from context
    const selectedUILibrary = selectedPackages.find((p) => p.isUILibrary);
    const selectedIconLibrary = selectedPackages.find((p) => p.isIconLibrary);
    const hasTailwind = selectedPackages.some((p) => p.name === 'tailwindcss');

    // Create template context with package selections
    return {
        ...context,
        config: {
            ...context.config,
            uiLibrary: selectedUILibrary?.name,
            iconLibrary: selectedIconLibrary?.name,
            useTailwind: hasTailwind,
            framework: pkg.frameworks?.[0],
        },
    };
}

/**
 * Generate files from package template
 */
async function generatePackageFiles(
    pkg: PackageConfig,
    targetDir: string,
    context: TemplateContext,
    selectedPackages: PackageConfig[],
): Promise<void> {
    if (!pkg.extraFilesContent) {
        return;
    }

    const templateContext = await generateFullContextForTemplate(
        pkg,
        targetDir,
        context,
        selectedPackages,
    );

    for (const [filePath, content] of Object.entries(pkg.extraFilesContent)) {
        const fullPath = path.join(targetDir, filePath);
        const isHandlebars = filePath.endsWith('.hbs');
        const targetPath = isHandlebars ? fullPath.slice(0, -4) : fullPath;

        // Create directory if it doesn't exist
        await fs.ensureDir(path.dirname(targetPath));

        // Process content if it's a Handlebars template
        const finalContent = isHandlebars ? processTemplate(content, templateContext) : content;

        // Write the file
        await fs.writeFile(targetPath, finalContent);
        logger.file('Created', path.relative(process.cwd(), targetPath));
    }
}

/**
 * Add selected packages
 * @param appDir Application directory
 * @param selectedPackages Selected packages
 * @returns true if installation was successful, false otherwise
 */
export async function addSelectedPackages(
    appDir: string,
    selectedPackages: PackageConfig[],
): Promise<boolean> {
    try {
        const packageJsonPath = path.join(appDir, 'package.json');
        const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

        // Initialize dependencies objects if they don't exist
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.scripts = packageJson.scripts || {};

        for (const pkg of selectedPackages) {
            // Handle direct installation
            const target = pkg.isDev ? packageJson.devDependencies : packageJson.dependencies;
            target[pkg.name] = pkg.version;

            // Add additional dependencies
            if (pkg.dependencies) {
                for (const dep of pkg.dependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.dependencies[name] = version;
                    logger.info(`Adding dependencies: ${dep}`, { icon: '📦' });
                }
            }

            // Add additional dev dependencies
            if (pkg.devDependencies) {
                for (const dep of pkg.devDependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.devDependencies[name] = version;
                    logger.info(`Adding dev dependencies: ${dep}`, { icon: '🔧' });
                }
            }

            // Generate package files
            await generatePackageFiles(
                pkg,
                appDir,
                {
                    appName: path.basename(appDir),
                    config: {
                        db: pkg.selectedConfig
                            ? {
                                  provider: pkg.selectedConfig,
                                  driver: getDriverForProvider(pkg.selectedConfig),
                                  connectionString:
                                      pkg.selectedConfig !== 'sqlite'
                                          ? 'process.env.DATABASE_URL'
                                          : undefined,
                                  url:
                                      pkg.selectedConfig === 'sqlite'
                                          ? 'sqlite.db'
                                          : 'process.env.DATABASE_URL',
                              }
                            : undefined,
                    },
                    dependencies: pkg.dependencies?.reduce(
                        (acc, dep) => {
                            const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                            acc[name] = version;
                            return acc;
                        },
                        {} as Record<string, string>,
                    ),
                    devDependencies: pkg.devDependencies?.reduce(
                        (acc, dep) => {
                            const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                            acc[name] = version;
                            return acc;
                        },
                        {} as Record<string, string>,
                    ),
                },
                selectedPackages,
            );
        }

        // Write updated package.json
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });

        logger.success('All packages added successfully to package.json.');
        return true;
    } catch (error) {
        logger.error('Failed to add packages:', {
            subtitle: 'You can add them manually later.',
        });
        console.error(error);
        return false;
    }
}

/**
 * Gets the appropriate driver for a database provider
 */
function getDriverForProvider(provider: string): string {
    const driverMap: Record<string, string> = {
        sqlite: 'better-sqlite3',
        postgres: 'pg',
        mysql: 'mysql2',
        singlestore: 'mysql2',
    };
    return driverMap[provider] || provider;
}

/**
 * Creates configuration files for selected packages
 * @param appDir Application directory
 * @param selectedPackages Selected packages
 * @param appName Application name
 * @param port Port number
 */
export async function createPackageConfigs(
    appDir: string,
    selectedPackages: PackageConfig[],
    appName: string,
    port: number,
): Promise<void> {
    for (const pkg of selectedPackages) {
        if (!pkg.configFiles || pkg.configFiles.length === 0) {
            continue;
        }

        // Skip all config files for shared packages
        if (pkg.installationType?.isShared) {
            continue;
        }

        logger.info(`Setting up configuration for ${pkg.displayName}`, {
            icon: '⚙️',
        });

        for (const configFile of pkg.configFiles) {
            const filePath = path.join(appDir, configFile.path);

            // Ensure directory exists
            await fs.ensureDir(path.dirname(filePath));

            // Get content
            let content =
                typeof configFile.content === 'function'
                    ? configFile.content(appName, port)
                    : configFile.content;

            // Replace placeholders
            content = content
                .replace(/{{appName}}/g, appName)
                .replace(/{{port}}/g, port.toString());

            // Write or append to file
            if (configFile.append && (await fs.pathExists(filePath))) {
                const existingContent = await fs.readFile(filePath, 'utf8');
                content = `${existingContent}\n${content}`;
            }

            // Process content if it's a template
            if (typeof content === 'string' && content.includes('{{')) {
                const templateContext = await generateFullContextForTemplate(
                    pkg,
                    appDir,
                    {
                        db: pkg.selectedConfig
                            ? {
                                  provider: pkg.selectedConfig,
                                  driver: getDriverForProvider(pkg.selectedConfig),
                                  connectionString:
                                      pkg.selectedConfig !== 'sqlite'
                                          ? 'process.env.DATABASE_URL'
                                          : undefined,
                                  url:
                                      pkg.selectedConfig === 'sqlite'
                                          ? 'sqlite.db'
                                          : 'process.env.DATABASE_URL',
                              }
                            : undefined,
                    },
                    selectedPackages,
                );
                content = processTemplate(content, templateContext);
            }

            await fs.writeFile(filePath, content);
            logger.file('Created', configFile.path);
        }
    }
}

/**
 * Updates environment variables for selected packages
 * @param appDir Application directory
 * @param selectedPackages Selected packages
 */
export async function updateEnvVars(
    appDir: string,
    selectedPackages: PackageConfig[],
): Promise<void> {
    const envPath = path.join(appDir, '.env');
    const envExamplePath = path.join(appDir, '.env.example');

    // Collect all environment variables
    const envVars: Record<string, string> = {};

    for (const pkg of selectedPackages) {
        if (pkg.envVars) {
            Object.assign(envVars, pkg.envVars);
        }
    }

    // If no environment variables to add, return
    if (Object.keys(envVars).length === 0) {
        return;
    }

    logger.info('Adding environment variables for selected packages', {
        icon: '🔑',
    });

    // Update .env file
    if (await fs.pathExists(envPath)) {
        let content = await fs.readFile(envPath, 'utf8');

        // Add each environment variable if it doesn't exist
        for (const [key, value] of Object.entries(envVars)) {
            if (!content.includes(`${key}=`)) {
                content += `\n# Added for ${key.split('_')[0].toLowerCase()} integration\n${key}=${value}\n`;
            }
        }

        await fs.writeFile(envPath, content);
    }

    // Update .env.example file
    if (await fs.pathExists(envExamplePath)) {
        let content = await fs.readFile(envExamplePath, 'utf8');

        // Add each environment variable if it doesn't exist
        for (const [key, value] of Object.entries(envVars)) {
            if (!content.includes(`${key}=`)) {
                content += `\n# Added for ${key.split('_')[0].toLowerCase()} integration\n${key}=${value}\n`;
            }
        }

        await fs.writeFile(envExamplePath, content);
    }
}

/**
 * Updates README.md with information about selected packages
 * @param appDir Application directory
 * @param selectedPackages Selected packages
 * @param appName Application name
 */
export async function updateReadme(
    appDir: string,
    selectedPackages: PackageConfig[],
    appName: string,
): Promise<void> {
    const readmePath = path.join(appDir, 'README.md');

    if (!(await fs.pathExists(readmePath))) {
        logger.warn('README.md not found, skipping update');
        return;
    }

    logger.info('Updating README.md with package documentation', {
        icon: '📝',
    });

    let content = await fs.readFile(readmePath, 'utf8');

    // Check if we already have an "Installed Packages" section
    if (content.includes('## Installed Packages')) {
        // If it exists, we'll replace it
        const regex = /## Installed Packages[\s\S]*?(?=##|$)/;
        const packagesSection = generatePackagesSection(selectedPackages, appName);
        content = content.replace(regex, packagesSection);
    } else {
        // Otherwise, add it at the end
        content += generatePackagesSection(selectedPackages, appName);
    }

    await fs.writeFile(readmePath, content);
}

/**
 * Generates the "Installed Packages" section for the README
 * @param selectedPackages Selected packages
 * @param appName Application name
 * @returns Formatted section content
 */
function generatePackagesSection(selectedPackages: PackageConfig[], appName: string): string {
    if (selectedPackages.length === 0) {
        return '';
    }

    let section = '\n\n## Installed Packages\n\n';
    section += 'This project includes the following packages:\n\n';

    for (const pkg of selectedPackages) {
        section += `- **${pkg.displayName}**: ${pkg.description}\n`;
    }

    // Add detailed documentation for each package
    for (const pkg of selectedPackages) {
        if (pkg.readmeSection) {
            const packageSection =
                typeof pkg.readmeSection === 'function'
                    ? pkg.readmeSection(appName)
                    : pkg.readmeSection.replace(/{{appName}}/g, appName);

            section += `\n${packageSection}\n`;
        }
    }

    return section;
}
