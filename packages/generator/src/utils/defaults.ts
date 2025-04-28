// import path from 'node:path';
// import fs from 'fs-extra';

// /**
//  * Returns a default name based on the selected framework
//  */
// export function getDefaultNameForFramework(framework: string): string {
//     const frameworkMap: Record<string, string> = {
//         hono: 'my-hono-api',
//         'react-vite': 'my-react-web-app',
//         'astro-vite': 'my-astro-website',
//         'tanstack-start': 'my-tanstack-fullstack-app'
//     };

//     return frameworkMap[framework] || 'my-app';
// }

// /**
//  * Returns a default description based on the selected framework and app name
//  */
// export function getDefaultDescriptionForFramework(framework: string, appName: string): string {
//     const frameworkMap: Record<string, string> = {
//         hono: `REST API built with Hono for ${appName}`,
//         'react-vite': `React web app built with Vite for ${appName}`,
//         'astro-vite': `Static site built with Astro for ${appName}`,
//         'tanstack-start': `Full-stack app built with TanStack Start for ${appName}`
//     };

//     return frameworkMap[framework] || `App ${appName}`;
// }

// /**
//  * Gets package defaults from root package.json
//  */
// export async function getPackageMetadataDefaults(): Promise<Record<string, string | undefined>> {
//     try {
//         const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
//         if (await fs.pathExists(rootPackageJsonPath)) {
//             const packageJson = await fs.readJson(rootPackageJsonPath);
//             return {
//                 author: packageJson.author,
//                 license: packageJson.license,
//                 repository: packageJson.repository.url,
//                 bugs: packageJson.bugs.url,
//                 homepage: packageJson.homepage
//             };
//         }
//     } catch (error) {
//         console.error('Error reading root package.json:', error);
//     }
//     return {};
// }

// /**
//  * List of available frameworks
//  */
// export const availableFrameworks = [
//     { name: 'Hono - Lightweight framework for APIs', value: 'hono' },
//     { name: 'React with Vite - For frontend apps', value: 'react-vite' },
//     { name: 'Astro with Vite - For static sites', value: 'astro-vite' },
//     {
//         name: 'TanStack Start - Full-stack React framework with SSR, streaming & more',
//         value: 'tanstack-start'
//     }
// ];
