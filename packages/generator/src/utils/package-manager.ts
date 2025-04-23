import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import type { PackageJson } from 'type-fest';
import type { PackageConfig } from '../packages/types.js';
import { promptForInstallationType } from '../prompts.js';
import { logger } from './logger.js';

/**
 * Creates a shared package
 * @param packageName Package name
 * @param templateName Template to use
 * @returns true if package was created successfully
 */
async function createSharedPackage(pkg: PackageConfig, packageName: string): Promise<boolean> {
    try {
        const packagesDir = path.join(process.cwd(), 'packages');
        const packageDir = path.join(packagesDir, packageName);
        const templateDir = path.join(
            global.templatesDir,
            'packages',
            pkg.sharedPackageTemplate || 'default',
        );

        // Check if template exists
        if (!fs.existsSync(templateDir)) {
            logger.error(`Template ${pkg.sharedPackageTemplate} not found`);
            return false;
        }

        // Create package directory
        await fs.ensureDir(packageDir);

        // Copy template files
        await fs.copy(templateDir, packageDir);

        // Update drizzle.config.ts based on selected database provider
        if (pkg.name === 'drizzle-orm' && pkg.selectedConfig) {
            const drizzleConfigPath = path.join(packageDir, 'drizzle.config.ts');
            if (await fs.pathExists(drizzleConfigPath)) {
                let content = await fs.readFile(drizzleConfigPath, 'utf8');

                // Update driver and credentials based on selected provider
                const configMap = {
                    sqlite: {
                        driver: 'better-sqlite3',
                        credentials: "{ url: 'sqlite.db' }",
                    },
                    postgres: {
                        driver: 'pg',
                        credentials: '{ connectionString: process.env.DATABASE_URL }',
                    },
                    mysql: {
                        driver: 'mysql2',
                        credentials: '{ url: process.env.DATABASE_URL }',
                    },
                    singlestore: {
                        driver: 'mysql2',
                        credentials: '{ url: process.env.DATABASE_URL }',
                    },
                };

                const config = configMap[pkg.selectedConfig];
                content = content.replace(/driver:\s*'[^']*'/, `driver: '${config.driver}'`);
                content = content.replace(
                    /dbCredentials:\s*{[^}]*}/,
                    `dbCredentials: ${config.credentials}`,
                );

                await fs.writeFile(drizzleConfigPath, content);
            }
        }

        // Apply configuration options if any
        if (pkg.configOptions?.dependencies && pkg.selectedConfig) {
            const configDeps = pkg.configOptions.dependencies[pkg.selectedConfig];
            if (configDeps) {
                const packageJsonPath = path.join(packageDir, 'package.json');
                const packageJson = await fs.readJson(packageJsonPath);

                // Add configuration-specific dependencies
                for (const dep of configDeps.dependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.dependencies[name] = version;
                }

                // Add configuration-specific dev dependencies
                for (const dep of configDeps.devDependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.devDependencies[name] = version;
                }

                await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
            }
        }

        // Update package.json
        const packageJsonPath = path.join(packageDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            packageJson.name = `@repo/${packageName}`;
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
        }

        logger.success(`Created shared package @repo/${packageName}`);
        return true;
    } catch (error) {
        logger.error('Failed to create shared package:', { subtitle: String(error) });
        return false;
    }
}

/**
 * Installs selected packages
 * @param appDir Application directory
 * @param selectedPackages Selected packages
 * @returns true if installation was successful, false otherwise
 */
export async function installSelectedPackages(
    appDir: string,
    selectedPackages: PackageConfig[],
): Promise<boolean> {
    try {
        const packageJsonPath = path.join(appDir, 'package.json');
        const packageJson = (await fs.readJson(packageJsonPath)) as PackageJson;

        // Initialize dependencies objects if they don't exist
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.devDependencies = packageJson.devDependencies || {};

        // Add selected packages to package.json
        for (const pkg of selectedPackages) {
            // Handle shared packages
            if (pkg.installationType?.isShared && pkg.canBeShared) {
                // Create shared package
                const success = await createSharedPackage(
                    pkg,
                    pkg.installationType.packageName || pkg.defaultSharedName || 'shared-package',
                );

                if (success) {
                    // Add shared package as workspace dependency
                    packageJson.dependencies[`@repo/${pkg.installationType.packageName}`] =
                        'workspace:*';
                    continue;
                }
            }

            // Handle direct installation
            const target = pkg.isDev ? packageJson.devDependencies : packageJson.dependencies;
            target[pkg.name] = pkg.version;

            // Add additional dependencies
            if (pkg.dependencies) {
                for (const dep of pkg.dependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.dependencies[name] = version;
                }
            }

            // Add additional dev dependencies
            if (pkg.devDependencies) {
                for (const dep of pkg.devDependencies) {
                    const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                    packageJson.devDependencies[name] = version;
                }
            }

            // Handle configuration-specific dependencies
            if (pkg.configOptions?.dependencies && pkg.selectedConfig) {
                const configDeps = pkg.configOptions.dependencies[pkg.selectedConfig];
                if (configDeps) {
                    // Add configuration-specific dependencies
                    for (const dep of configDeps.dependencies) {
                        const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                        packageJson.dependencies[name] = version;
                    }
                    // Add configuration-specific dev dependencies
                    for (const dep of configDeps.devDependencies) {
                        const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
                        packageJson.devDependencies[name] = version;
                    }
                }
            }
        }

        // Write updated package.json
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });

        // Log the packages being installed
        const regularDeps = Object.entries(packageJson.dependencies || {}).map(
            ([name, version]) => `${name}@${version}`,
        );
        const devDeps = Object.entries(packageJson.devDependencies || {}).map(
            ([name, version]) => `${name}@${version}`,
        );

        if (regularDeps.length > 0) {
            logger.info(`Adding dependencies: ${regularDeps.join(', ')}`, { icon: '📦' });
        }

        if (devDeps.length > 0) {
            logger.info(`Adding dev dependencies: ${devDeps.join(', ')}`, { icon: '🔧' });
        }

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

                // Special handling for astro.config.mjs
                if (filePath.endsWith('astro.config.mjs')) {
                    await updateAstroConfig(filePath, pkg.name);
                } else {
                    // Generic append
                    await fs.writeFile(filePath, `${existingContent}\n${content}`);
                }
            } else {
                await fs.writeFile(filePath, content);
            }

            // Special handling for TanStack Start
            if (filePath.endsWith('tanstack.config.ts') && pkg.name.includes('drizzle')) {
                await updateTanStackConfig(filePath, pkg.name);
            }

            logger.file('Created', configFile.path);
        }
    }
}

/**
 * Updates Astro configuration file with new integrations
 * @param configPath Path to astro.config.mjs
 * @param packageName Package name to add
 */
async function updateAstroConfig(configPath: string, packageName: string): Promise<void> {
    try {
        let content = await fs.readFile(configPath, 'utf8');

        // Map package names to import names and integration names
        const integrationMap: Record<string, { import: string; integration: string }> = {
            '@astrojs/router': { import: 'router', integration: 'router()' },
            'astro:transitions': { import: '{ transitions }', integration: 'transitions()' },
            '@astrojs/react': { import: 'react', integration: 'react()' },
            '@astrojs/tailwind': { import: 'tailwind', integration: 'tailwind()' },
            '@astrojs/i18n': { import: 'i18n', integration: 'i18n()' },
        };

        const integration = integrationMap[packageName];

        if (!integration) {
            return;
        }

        // Check if import already exists
        if (!content.includes(`import ${integration.import} from '${packageName}'`)) {
            // Add import
            const importStatement = `import ${integration.import} from '${packageName}';\n`;
            content = content.replace(/import {/m, `${importStatement}import {`);
        }

        // Check if integration already exists in the integrations array
        if (!content.includes(integration.integration)) {
            // Add integration to the integrations array
            content = content.replace(/integrations:\s*\[(.*?)\]/s, (match, integrations) => {
                const newIntegrations = integrations.trim()
                    ? `${integrations.trim()}, ${integration.integration}`
                    : integration.integration;
                return `integrations: [${newIntegrations}]`;
            });
        }

        await fs.writeFile(configPath, content);
        logger.success(`Added ${packageName} integration to Astro config`);
    } catch (error) {
        logger.warn(`Failed to update Astro config for ${packageName}`, {
            subtitle: 'You may need to manually update astro.config.mjs',
        });
    }
}

/**
 * Updates TanStack Start configuration file with new integrations
 * @param configPath Path to tanstack.config.ts
 * @param packageName Package name to add
 */
async function updateTanStackConfig(configPath: string, packageName: string): Promise<void> {
    try {
        let content = await fs.readFile(configPath, 'utf8');

        // For Drizzle, add database configuration
        if (packageName.includes('drizzle')) {
            if (!content.includes('database:')) {
                content = content.replace(
                    /export default defineConfig\(\{/,
                    `export default defineConfig({\n  database: {\n    provider: "sqlite",\n    url: process.env.DATABASE_URL || "sqlite.db"\n  },`,
                );
                await fs.writeFile(configPath, content);
                logger.success('Added database configuration to TanStack config');
            }
        }
    } catch (error) {
        logger.warn(`Failed to update TanStack config for ${packageName}`, {
            subtitle: 'You may need to manually update tanstack.config.ts',
        });
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
