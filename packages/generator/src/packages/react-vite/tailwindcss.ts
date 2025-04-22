import type { PackageConfig } from '../types.js';

export const tailwindcssPackage: PackageConfig = {
    name: 'tailwindcss',
    displayName: 'TailwindCSS',
    description: 'Utility-first CSS framework',
    version: '^3.4.0',
    isDev: true,
    devDependencies: ['postcss@^8.4.32', 'autoprefixer@^10.4.16'],
    configFiles: [
        {
            path: 'postcss.config.js',
            content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
        },
        {
            path: 'tailwind.config.js',
            content: `import baseConfig from "@repo/config/tailwind.config"

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
}`,
        },
    ],
    readmeSection: `
## TailwindCSS

This project uses [TailwindCSS](https://tailwindcss.com/) for styling.

TailwindCSS is already configured and ready to use. The configuration extends the base configuration from \`@repo/config/tailwind.config.js\`.

Example usage:

\`\`\`jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-800">Hello World</h1>
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Click me
  </button>
</div>
\`\`\`
`,
};
