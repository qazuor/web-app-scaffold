import type { ConfigsManager } from '../../../../src/core/ConfigsManager.js';
import type { FrameworksManager } from '../../../../src/core/FrameworksManager.js';
import type { PackagesManager } from '../../../../src/core/PackagesManager.js';
import type { PackageScript } from '../../../../src/types/index.js';

export const getScripts = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
): PackageScript[] => {
    const framework = configsManager.getFramework().getName();
    const scripts = [...getExampleScripts()];
    if (framework === 'astro-vite') {
        scripts.push(...getExampleScripts('astro-vite'));
    } else if (framework === 'hono') {
        scripts.push(...getExampleScripts('hono'));
    } else if (framework === 'react-vite') {
        scripts.push(...getExampleScripts('react-vite'));
    } else if (framework === 'tanstatck-start') {
        scripts.push(...getExampleScripts('tanstatck-start'));
    }
    return scripts;
};

const getExampleScripts = (framework?: string) => {
    return [
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}script-1`,
            command: 'example_value1'
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}script-2`,
            command: 'example_value2',
            addInShared: true,
            addInApp: true
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}script-3`,
            command: 'example_value3',
            addInShared: true,
            addInApp: false
        },
        {
            name: `${framework || ''}${framework ? '-framework-' : ''}script-4`,
            command: 'example_value4',
            addInShared: false,
            addInApp: true
        }
    ];
};
