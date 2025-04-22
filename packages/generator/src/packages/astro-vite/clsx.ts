import type { PackageConfig } from '../types.js';

export const clsxPackage: PackageConfig = {
    name: 'clsx',
    displayName: 'clsx',
    description: 'A tiny utility for constructing className strings conditionally',
    version: '^2.0.0',
    readmeSection: `
## clsx

This project uses [clsx](https://github.com/lukeed/clsx) for constructing className strings conditionally.

Example usage:

\`\`\`typescript
import clsx from 'clsx';

const className = clsx(
  'base-class',
  isActive && 'active-class',
  { 'error-class': hasError },
  ['always', 'included']
);
\`\`\`
`,
};
