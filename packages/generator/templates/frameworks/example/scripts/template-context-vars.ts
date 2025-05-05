import type { ConfigsManager } from '../../../../src/core/ConfigsManager.js';
import type { FrameworksManager } from '../../../../src/core/FrameworksManager.js';
import type { PackagesManager } from '../../../../src/core/PackagesManager.js';

export const getContextVars = (
    configsManager: ConfigsManager,
    _frameworksManager: FrameworksManager,
    _packagesManager: PackagesManager
) => {
    return { var1: 'contextVarFrom temlpate-context-var.ts' };
};
