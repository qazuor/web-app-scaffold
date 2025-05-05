import type { ConfigsManager } from '../../../../src/core/ConfigsManager.js';
import type { FrameworksManager } from '../../../../src/core/FrameworksManager.js';
import type { PackagesManager } from '../../../../src/core/PackagesManager.js';
import type { PackageEnvVar } from '../../../../src/types/index.js';

export const getVars = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
): PackageEnvVar[] => {
    const framework = configsManager.getFramework().getName();
    const envVars = [...getEnvVarsExample()];
    if (framework === 'astro-vite') {
        envVars.push(...getEnvVarsExample('astro-vite'));
    } else if (framework === 'hono') {
        envVars.push(...getEnvVarsExample('hono'));
    } else if (framework === 'react-vite') {
        envVars.push(...getEnvVarsExample('react-vite'));
    } else if (framework === 'tanstatck-start') {
        envVars.push(...getEnvVarsExample('tanstatck-start'));
    }
    return envVars;
};

const getEnvVarsExample = (framework?: string) => {
    return [
        {
            name: `${framework || ''}${framework ? '_FRAMEWORK_' : ''}ENVVAR_EXAMPLE_FROM_PACKAGE_1`,
            value: 'example_value1'
        },
        {
            name: `${framework || ''}${framework ? '_FRAMEWORK_-' : ''}ENVVAR_EXAMPLE_FROM_PACKAGE_2`,
            value: 'example_value2',
            addInShared: true,
            addInApp: true
        },
        {
            name: `${framework || ''}${framework ? '_FRAMEWORK_-' : ''}ENVVAR_EXAMPLE_FROM_PACKAGE_3`,
            value: 'example_value3',
            addInShared: true,
            addInApp: false
        },
        {
            name: `${framework || ''}${framework ? '_FRAMEWORK_-' : ''}ENVVAR_EXAMPLE_FROM_PACKAGE_4`,
            value: 'example_value4',
            addInShared: false,
            addInApp: true
        }
    ];
};
