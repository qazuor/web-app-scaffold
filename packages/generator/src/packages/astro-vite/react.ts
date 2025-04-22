import type { PackageConfig } from '../types.js';

export const reactPackage: PackageConfig = {
    name: '@astrojs/react',
    displayName: 'Astro React Integration',
    description: 'Use React components in Astro',
    version: '^3.0.10',
    configFiles: [
        {
            path: 'astro.config.mjs',
            content: '',
            append: true,
        },
    ],
    readmeSection: `
## Astro React Integration

This project uses [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) to use React components in Astro.

Example usage:

\`\`\`astro
---
// src/pages/index.astro
import MyReactComponent from '../components/MyReactComponent';
---
<MyReactComponent client:load />
\`\`\`
`,
};
