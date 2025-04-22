import type { PackageConfig } from '../types.js';

export const routerPackage: PackageConfig = {
    name: '@astrojs/router',
    displayName: 'Astro Router',
    description: 'Client-side routing for Astro',
    version: '^0.3.0',
    configFiles: [
        {
            path: 'astro.config.mjs',
            content: '',
            append: true,
        },
    ],
    readmeSection: `
## Astro Router

This project uses [@astrojs/router](https://docs.astro.build/en/guides/routing/) for client-side routing.

Example usage:

\`\`\`astro
---
// src/pages/index.astro
---
<a href="/about">About</a>
\`\`\`
`,
};
