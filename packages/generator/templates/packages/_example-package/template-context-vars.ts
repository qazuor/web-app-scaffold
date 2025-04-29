import { PackageConfig } from '../../../src/types/index.js';

export const getContextVars = (pkg: PackageConfig, context: ContextForTemplate) => {
    return { providers: pkg.selectedConfig || [] };
};
