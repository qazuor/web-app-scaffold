import type { ConfigsManager } from '../../../../src/core/ConfigsManager.js';
import type { FrameworksManager } from '../../../../src/core/FrameworksManager.js';
import type { PackagesManager } from '../../../../src/core/PackagesManager.js';
import type { PackageDependency } from '../../../../src/types/index.js';

export const getDependencies = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
): PackageDependency[] => {
    const framework = configsManager.getFramework().getName();
    const dependencies = [...getDependencyExample()];
    if (framework === 'astro-vite') {
        dependencies.push(...getDependencyExample('astro-vite'));
    } else if (framework === 'hono') {
        dependencies.push(...getDependencyExample('hono'));
    } else if (framework === 'react-vite') {
        dependencies.push(...getDependencyExample('react-vite'));
    } else if (framework === 'tanstatck-start') {
        dependencies.push(...getDependencyExample('tanstatck-start'));
    }
    return dependencies;
};

export const getDevDependencies = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
): PackageDependency[] => {
    const framework = configsManager.getFramework().getName();
    const dependencies = [...getDependencyExample(undefined, true)];
    if (framework === 'astro-vite') {
        dependencies.push(...getDependencyExample('astro-vite', true));
    } else if (framework === 'hono') {
        dependencies.push(...getDependencyExample('hono', true));
    } else if (framework === 'react-vite') {
        dependencies.push(...getDependencyExample('react-vite', true));
    } else if (framework === 'tanstatck-start') {
        dependencies.push(...getDependencyExample('tanstatck-start', true));
    }
    return dependencies;
};

const getDependencyExample = (framework?: string, isDev?: boolean) => {
    return [
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}example-${isDev ? 'dev-' : ''}dependency-1`,
            version: '^1.0.0'
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}example-${isDev ? 'dev-' : ''}dependency-2`,
            version: '^1.0.0',
            addInShared: true,
            addInApp: true
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}example-${isDev ? 'dev-' : ''}dependency-3`,
            version: '^1.0.0',
            addInShared: true,
            addInApp: false
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}example-${isDev ? 'dev-' : ''}dependency-4`,
            version: '^1.0.0',
            addInShared: false,
            addInApp: true
        }
    ];
};
