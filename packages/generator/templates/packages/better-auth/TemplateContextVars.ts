import type { PackageConfig } from '../../../src/types/package.js';
import type { ContextForTemplate } from '../../../src/utils/package-manager.js';

export const getContextVars = (pkg: PackageConfig, context: ContextForTemplate) => {
    return { providers: pkg.selectedConfig || [] };
};
