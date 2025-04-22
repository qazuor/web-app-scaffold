import type { PackageConfig } from '../types.js';

export const seoPackage: PackageConfig = {
    name: 'astro-seo',
    displayName: 'Astro SEO',
    description: 'SEO component for Astro',
    version: '^0.8.0',
    readmeSection: `
## Astro SEO

This project uses [astro-seo](https://github.com/jonasmerlin/astro-seo) for SEO optimization.

Example usage:

\`\`\`astro
---
// src/layouts/Layout.astro
import { SEO } from 'astro-seo';
---
<html>
  <head>
    <SEO
      title="My Page"
      description="This is my page description"
      openGraph={{
        basic: {
          title: "My Page",
          type: "website",
          image: "https://example.com/image.jpg",
        }
      }}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
\`\`\`
`,
};
