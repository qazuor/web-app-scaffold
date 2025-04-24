import path from 'node:path';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import type { PackageJson } from 'type-fest';
import type { PackageConfig } from '../types/package.js';
import { createDirectory } from './file-operations.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);

type ContextForTemplate = {
    appDir: string;
    appName: string;
    framework: string;
    description: string;
    port: number;
    uiLibrary: string | undefined;
    iconLibrary: string | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: dynamic structure depends on package
    contextPackageVars?: any;
    packageName?: string | undefined;
};

/**
 * Retrieves the application's package.json as a JSON object.
 * @param appDir - The path to the application directory.
 * @returns A Promise that resolves with the parsed package.json content.
 */
export async function getAppPakageJson(appDir: string) {
    return await fs.readJson(getPackageJsonPath(appDir));
}

/**
 * Constructs the absolute path to the package.json file.
 * @param appDir - The path to the application directory.
 * @returns The full path to package.json.
 */
export function getPackageJsonPath(appDir: string) {
    return path.join(appDir, 'package.json');
}

/**
 * Writes the modified package.json file to disk.
 * @param packageJsonPath - The path to save the package.json file.
 * @param packageJson - The PackageJson object to persist.
 * @returns A Promise that resolves once the file is written.
 */
export async function savePackageJson(packageJsonPath: string, packageJson: PackageJson) {
    return await fs.writeJson(packageJsonPath, packageJson, { spaces: 4 });
}

/**
 * Adds or updates a single npm script entry in package.json.
 * @param packageJson - The current package.json content.
 * @param name - The script name.
 * @param code - The script command.
 * @returns The updated packageJson object.
 */
export async function addScript(packageJson: PackageJson, name: string, code: string) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts[name.trim()] = code.trim();
    logger.info(`Adding Script: ${name.trim()}:'${code.trim()}' to package.json`, { icon: '⚙️' });
    return packageJson;
}

/**
 * Adds or updates multiple npm scripts in package.json.
 * @param packageJson - The current package.json content.
 * @param scripts - A record of script names and their corresponding commands.
 */
export async function addScripts(
    packageJson: PackageJson,
    scripts: Record<string, string> | undefined
) {
    if (scripts && typeof scripts === 'object') {
        for (const [name, code] of Object.entries(scripts)) {
            await addScript(packageJson, name, code);
        }
    }
}

/**
 * Adds scripts to package.json based on the selected packages' config options.
 * @param packageJson - The current package.json content.
 * @param selectedPackages - A list of selected packages with optional script config.
 */
export async function addScriptsFromOptionsConfig(
    packageJson: PackageJson,
    selectedPackages: PackageConfig[]
) {
    for (const pkg of selectedPackages) {
        if (pkg.configOptions?.resultForPrompt) {
            if (pkg.selectedConfig) {
                await addScripts(
                    packageJson,
                    pkg.configOptions.resultForPrompt[pkg.selectedConfig].scripts
                );
            } else {
                if (pkg.configOptions?.result) {
                    await addScripts(packageJson, pkg.configOptions.result.scripts);
                }
            }
        } else if (pkg.configOptions?.result) {
            await addScripts(packageJson, pkg.configOptions.result.scripts);
        }
    }
}

/**
 * Adds a dependency to either 'dependencies' or 'devDependencies' in package.json.
 * @param packageJson - The package.json object to update.
 * @param isDev - Whether the dependency is a development dependency.
 * @param name - The name of the dependency.
 * @param version - The version to install.
 * @returns The updated packageJson object.
 */
export async function addDependency(
    packageJson: PackageJson,
    isDev: boolean,
    name: string,
    version: string
) {
    const target = isDev ? 'devDependencies' : 'dependencies';
    packageJson[target] = packageJson[target] || {};
    packageJson[target][name.trim()] = version.trim();
    logger.info(
        `Adding ${isDev ? 'devDependencies' : 'dependencies'}: '${name.trim()}' version: '${version.trim()}'`,
        {
            icon: isDev ? '📦' : '🔧'
        }
    );
    return packageJson;
}

/**
 * Adds dependencies defined in a config array to package.json.
 * @param packageJson - The package.json object to update.
 * @param isDev - Whether to add to devDependencies.
 * @param dependencies - An array of strings in the form 'name@version'.
 */
export async function addDependenciesFromConfig(
    packageJson: PackageJson,
    isDev: boolean,
    dependencies: string[] | undefined
) {
    if (!dependencies) {
        return packageJson;
    }
    for (const dep of dependencies) {
        const [name, version] = dep.split(/(?!^)@(.+)/).filter(Boolean);
        return await addDependency(packageJson, isDev, name, version);
    }
}

/**
 * Adds dependencies to package.json from selected packages' config options.
 * @param packageJson - The package.json object to update.
 * @param selectedPackages - Packages whose dependencies should be added.
 */
export async function addDependenciesFromOptionsConfig(
    packageJson: PackageJson,
    selectedPackages: PackageConfig[]
) {
    for (const pkg of selectedPackages) {
        if (pkg.configOptions?.resultForPrompt) {
            if (pkg.selectedConfig) {
                await addDependenciesFromConfig(
                    packageJson,
                    false,
                    pkg.configOptions.resultForPrompt[pkg.selectedConfig].dependencies
                );
                await addDependenciesFromConfig(
                    packageJson,
                    true,
                    pkg.configOptions.resultForPrompt[pkg.selectedConfig].devDependencies
                );
            } else {
                if (pkg.configOptions?.result) {
                    await addDependenciesFromConfig(
                        packageJson,
                        false,
                        pkg.configOptions.result.dependencies
                    );
                    await addDependenciesFromConfig(
                        packageJson,
                        true,
                        pkg.configOptions.result.devDependencies
                    );
                }
            }
        } else if (pkg.configOptions?.result) {
            await addDependenciesFromConfig(
                packageJson,
                false,
                pkg.configOptions.result.dependencies
            );
            await addDependenciesFromConfig(
                packageJson,
                true,
                pkg.configOptions.result.devDependencies
            );
        }
    }
}

/**
 * Processes a Handlebars template using the provided context.
 * @param content - Raw template content.
 * @param context - Context to inject into the template.
 * @returns Rendered template string.
 */
function processTemplate(content: string, context: ContextForTemplate): string {
    const template = Handlebars.compile(content);
    return template(context);
}

/**
 * Generates files for a specific package based on its extraFilesContent.
 * If file ends in .hbs, it will be processed as a Handlebars template.
 * @param appDir - The root directory of the app.
 * @param pkg - The package containing template definitions.
 * @param context - Data to inject into templates.
 */
export async function generatePackageFiles(
    appDir: string,
    pkg: PackageConfig,
    context: ContextForTemplate,
    includePackageJson = false
) {
    if (pkg.extraFilesContent) {
        for (const [filePath, content] of Object.entries(pkg.extraFilesContent)) {
            if (filePath === 'package.json.hbs' && !includePackageJson) {
                continue;
            }
            const fullPath = path.join(appDir, filePath);
            const isHandlebars = filePath.endsWith('.hbs');
            const targetPath = isHandlebars ? fullPath.slice(0, -4) : fullPath;

            await fs.ensureDir(path.dirname(targetPath));

            const finalContent = isHandlebars ? processTemplate(content, context) : content;

            await fs.writeFile(targetPath, finalContent);

            logger.info(`Generated ${path.relative(process.cwd(), targetPath)} for ${pkg.name}`, {
                icon: '📝'
            });
        }
    }
}

/**
 * Generates all necessary files for selected packages.
 * @param appDir - Application directory.
 * @param selectedPackages - List of selected packages.
 * @param context - Template context for rendering.
 */
export async function generateSelectedPackagesFiles(
    appDir: string,
    selectedPackages: PackageConfig[],
    context: ContextForTemplate,
    includePackageJson?: boolean
) {
    for (const pkg of selectedPackages) {
        if (pkg.configOptions?.resultForPrompt) {
            if (pkg.selectedConfig) {
                context.contextPackageVars =
                    pkg.configOptions.resultForPrompt[pkg.selectedConfig].contextPackageVars;
            } else if (pkg.configOptions?.result) {
                context.contextPackageVars = pkg.configOptions.result.contextPackageVars;
            }
        } else if (pkg.configOptions?.result) {
            context.contextPackageVars = pkg.configOptions.result.contextPackageVars;
        }
        await generatePackageFiles(appDir, pkg, context, includePackageJson);
    }
    logger.info('Generated all selected packages files', { icon: '📝' });
}

/**
 * Adds selected packages to the app by modifying package.json, adding scripts, generating files, etc.
 * @param appDir - Application directory.
 * @param appName - Application name.
 * @param framework - Selected framework.
 * @param description - Project description.
 * @param port - App port.
 * @param uiLibrary - UI library configuration.
 * @param iconLibrary - Icon library configuration.
 * @param selectedPackages - List of selected packages.
 * @returns True if successful, otherwise false.
 */
export async function addSelectedPackages(
    appDir: string,
    appName: string,
    framework: string,
    description: string,
    port: number,
    uiLibrary: PackageConfig | null,
    iconLibrary: PackageConfig | null,
    selectedPackages: PackageConfig[]
): Promise<boolean> {
    try {
        const packageJson: PackageJson = await getAppPakageJson(appDir);

        for (const pkg of selectedPackages) {
            if (pkg.installationType?.isShared) {
                await addSharedPackage(
                    appDir,
                    appName,
                    framework,
                    description,
                    port,
                    packageJson,
                    pkg,
                    uiLibrary,
                    iconLibrary,
                    selectedPackages
                );
            } else {
                await addPackageDirectlyToApp(
                    appDir,
                    appName,
                    framework,
                    description,
                    port,
                    packageJson,
                    pkg,
                    uiLibrary,
                    iconLibrary,
                    selectedPackages
                );
            }
        }

        logger.success('All selected packages added');
        return true;
    } catch (error) {
        logger.error('Failed to add selected packages', {
            subtitle: String(error)
        });
        return false;
    }
}

/**
 * Installs a package directly into the application's local package.json.
 *
 * This function performs several tasks:
 * 1. Adds the main package as a dependency (or devDependency).
 * 2. Adds any extra dependencies and devDependencies from the package's config.
 * 3. Processes additional config-based dependencies from all selected packages.
 * 4. Injects npm scripts defined in the package or its config into package.json.
 * 5. Generates any additional files for the selected packages (using Handlebars if needed).
 * 6. Persists the updated package.json on disk.
 *
 * @param appDir - The application directory where the package will be installed.
 * @param appName - The name of the application being created or modified.
 * @param framework - The framework used (e.g., react-vite, astro, etc).
 * @param description - A short description of the application.
 * @param port - The port the application will use (used in templating).
 * @param packageJson - The current state of the app's package.json file.
 * @param pkg - The specific package to install directly into the app.
 * @param uiLibrary - Optional UI library selected for use in the project.
 * @param iconLibrary - Optional icon library selected for use in the project.
 * @param selectedPackages - All packages selected for the current installation session.
 * @returns A Promise that resolves to `true` if the operation succeeded, `false` if an error occurred.
 */
export async function addPackageDirectlyToApp(
    appDir: string,
    appName: string,
    framework: string,
    description: string,
    port: number,
    packageJson: PackageJson,
    pkg: PackageConfig,
    uiLibrary: PackageConfig | null,
    iconLibrary: PackageConfig | null,
    selectedPackages: PackageConfig[]
): Promise<boolean> {
    try {
        await addDependency(packageJson, !!pkg.isDev, pkg.name, pkg.version);
        await addDependenciesFromConfig(packageJson, false, pkg.dependencies);
        await addDependenciesFromConfig(packageJson, true, pkg.devDependencies);
        await addDependenciesFromOptionsConfig(packageJson, selectedPackages);

        const contextForTemplates: ContextForTemplate = {
            appDir,
            appName,
            framework,
            description,
            port,
            uiLibrary: uiLibrary?.name,
            iconLibrary: iconLibrary?.name
        };

        await addScripts(packageJson, pkg.scripts);
        await addScriptsFromOptionsConfig(packageJson, selectedPackages);

        await generateSelectedPackagesFiles(appDir, selectedPackages, contextForTemplates);

        await savePackageJson(getPackageJsonPath(appDir), packageJson);
        logger.success(`${pkg.name} package added to package.json`);
        return true;
    } catch (error) {
        logger.error('Failed to add selected packages to package.json', {
            subtitle: String(error)
        });
        return false;
    }
}

/**
 * Adds a shared package to the monorepo workspace and links it to the current application.
 * This is useful for centralizing logic or UI in `packages/*` and referencing it via workspace protocols.
 *
 * Steps performed:
 * 1. Creates the shared package folder (e.g., `../../packages/my-shared-lib`).
 * 2. Generates files in the shared package using templates.
 * 3. Adds the shared package as a dependency in the app's package.json using `workspace:*`.
 * 4. Saves the updated package.json.
 *
 * @param appDir - The root directory of the app.
 * @param appName - The name of the application.
 * @param framework - The framework used by the app (e.g., react, astro, etc).
 * @param description - A brief description of the application.
 * @param port - The port number assigned to the application.
 * @param packageJson - The current state of the app's package.json.
 * @param pkg - The package being installed as shared.
 * @param uiLibrary - Optional selected UI library package.
 * @param iconLibrary - Optional selected icon library package.
 * @param selectedPackages - All selected packages for this setup, passed for context/template generation.
 * @returns A Promise that resolves to `true` if the operation was successful, or `false` otherwise.
 */
export async function addSharedPackage(
    appDir: string,
    appName: string,
    framework: string,
    description: string,
    port: number,
    packageJson: PackageJson,
    pkg: PackageConfig,
    uiLibrary: PackageConfig | null,
    iconLibrary: PackageConfig | null,
    selectedPackages: PackageConfig[]
): Promise<boolean> {
    try {
        if (!pkg.installationType || !pkg.installationType.packageName) {
            return false;
        }

        const sharedPackageDir = path.join(
            appDir,
            '../../packages',
            pkg.installationType.packageName
        );

        await createDirectory(sharedPackageDir);

        const contextForTemplates: ContextForTemplate = {
            appDir,
            appName,
            framework,
            description,
            port,
            uiLibrary: uiLibrary?.name,
            iconLibrary: iconLibrary?.name,
            packageName: pkg.installationType.packageName
        };

        await generateSelectedPackagesFiles(
            sharedPackageDir,
            selectedPackages,
            contextForTemplates,
            true
        );

        await addDependency(
            packageJson,
            false,
            `@repo/${pkg.installationType.packageName}`,
            'workspace:*'
        );

        await savePackageJson(getPackageJsonPath(appDir), packageJson);
        logger.success(`${pkg.name} shared package successfully created`);
        logger.success(`${pkg.name} package added as dependency to package.json`);

        return true;
    } catch (error) {
        logger.error('Failed to add selected packages to package.json', {
            subtitle: String(error)
        });
        return false;
    }
}

/**
 * Updates .env and .env.example with environment variables from selected packages.
 * If a variable already exists, it won't be duplicated.
 * @param appDir - Application directory.
 * @param selectedPackages - List of selected packages.
 */
export async function updateEnvVars(
    appDir: string,
    selectedPackages: PackageConfig[]
): Promise<void> {
    const envPath = path.join(appDir, '.env');
    const envExamplePath = path.join(appDir, '.env.example');

    const envVars: Record<string, string> = {};
    for (const pkg of selectedPackages) {
        if (pkg.envVars) {
            Object.assign(envVars, pkg.envVars);
        }
    }

    if (Object.keys(envVars).length === 0) {
        return;
    }

    logger.info('Adding environment variables for selected packages', { icon: '🔑' });

    await updateEnvFile(envPath, envVars);
    await updateEnvFile(envExamplePath, envVars);
}

/**
 * Updates a .env-style file by appending environment variables if they don't already exist.
 * Adds comments to clarify which integration each variable is for.
 *
 * @param envFilePath - The absolute path to the environment file (e.g., `.env` or `.env.example`).
 * @param envVars - A record of environment variables to insert (key-value pairs).
 * @returns A Promise that resolves once the file is updated.
 */
async function updateEnvFile(envFilePath: string, envVars: Record<string, string>) {
    if (!(await fs.pathExists(envFilePath))) return;

    let content = await fs.readFile(envFilePath, 'utf8');

    for (const [key, value] of Object.entries(envVars)) {
        if (!content.includes(`${key}=`)) {
            content += `\n# Added for ${key.split('_')[0].toLowerCase()} integration\n${key}=${value}\n`;
        }
    }

    await fs.writeFile(envFilePath, content);
}

/**
 * Updates README.md to include a list of installed packages and their documentation.
 * @param appDir - Application directory.
 * @param selectedPackages - List of selected packages.
 * @param appName - Name of the application.
 */
export async function updateReadme(
    appDir: string,
    selectedPackages: PackageConfig[],
    appName: string
): Promise<void> {
    const readmePath = path.join(appDir, 'README.md');

    if (!(await fs.pathExists(readmePath))) {
        logger.warn('README.md not found, skipping update');
        return;
    }

    logger.info('Updating README.md with package documentation', { icon: '📝' });

    let content = await fs.readFile(readmePath, 'utf8');
    const section = generatePackagesSection(selectedPackages, appName);

    content = await replaceReadmeSection(content, section);
    await fs.writeFile(readmePath, content, 'utf8');
}

/**
 * Replaces or appends the "Installed Packages" section in the README content.
 * Ensures the section is updated if it exists, or appended if missing.
 *
 * @param content - The original README markdown content.
 * @param newSection - The new markdown section to insert.
 * @returns The modified README content with the section updated or appended.
 */
function replaceReadmeSection(content: string, newSection: string): string {
    const regex = /## Installed Packages[\s\S]*?(?=##|$)/;
    return content.includes('## Installed Packages')
        ? content.replace(regex, newSection)
        : content + newSection;
}

/**
 * Generates the markdown section that describes the installed packages.
 * @param selectedPackages - List of packages to document.
 * @param appName - Application name for dynamic replacements.
 * @returns Markdown string.
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
