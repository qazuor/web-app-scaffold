import type { ConfigsManager } from '../../../../src/core/ConfigsManager.js';
import type { FrameworksManager } from '../../../../src/core/FrameworksManager.js';
import type { PackagesManager } from '../../../../src/core/PackagesManager.js';
import type { PackageScript } from '../../../../src/types/index.js';

export const getScripts = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
): PackageScript[] => {
    const port = configsManager.getPort();
    return [
        {
            name: 'dev',
            command: `react-router dev --port=${port}`
        }
    ];
};
