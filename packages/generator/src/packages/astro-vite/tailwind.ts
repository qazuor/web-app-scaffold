import type { PackageConfig } from '../types.js';

export const tailwindPackage: PackageConfig = {
    name: '@astrojs/tailwind',
    displayName: 'Astro Tailwind Integration',
    description: 'Use Tailwind CSS in Astro',
    version: '^5.1.0',
    configFiles: [
        {
            path: 'astro.config.mjs',
            content: '',
            append: true,
        },
    ],
    readmeSection: `
## Astro Tailwind Integration

This project uses [@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) for Tailwind CSS support.

Example usage:

\`\`\`astro
---
// src/pages/index.astro
---
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 class="text-2xl font-bold text-gray-800">Hello World</h1>
  <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Click me
  </button>
</div>
\`\`\`
`,
};
