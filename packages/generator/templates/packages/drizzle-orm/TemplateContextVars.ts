import type { PackageConfig } from '../../../src/types/package.js';
import type { ContextForTemplate } from '../../../src/utils/package-manager.js';

export const getContextVars = (pkg: PackageConfig, context: ContextForTemplate) => {
    if (!pkg.selectedConfig) {
        throw new Error('No selected config found');
    }
    switch (pkg.selectedConfig) {
        case 'sqlite':
            return { provider: 'sqlite', driver: 'better-sqlite3' };
        case 'postgres':
            return { provider: 'postgres', driver: 'pg' };
        case 'mysql':
            return { provider: 'mysql', driver: 'mysql2' };
        case 'singlestore':
            return { provider: 'singlestore', driver: null };
    }
};
