/**
 * Returns a default name based on the selected framework
 * @param framework Selected framework
 * @returns Default app name
 */
export function getDefaultNameForFramework(framework: string): string {
    const frameworkMap: Record<string, string> = {
        hono: 'my-api',
        'react-vite': 'my-react-web',
        'astro-vite': 'my-astro-site',
        'tanstack-start': 'my-tanstack-fullstack-app',
    };

    return frameworkMap[framework] || 'my-app';
}

/**
 * Returns a default description based on the selected framework and app name
 * @param framework Selected framework
 * @param appName Application name
 * @returns Default description
 */
export function getDefaultDescriptionForFramework(framework: string, appName: string): string {
    const frameworkMap: Record<string, string> = {
        hono: `REST API built with Hono for ${appName}`,
        'react-vite': `React web app built with Vite for ${appName}`,
        'astro-vite': `Static site built with Astro for ${appName}`,
        'tanstack-start': `Full-stack app built with TanStack Start for ${appName}`,
    };

    return frameworkMap[framework] || `App ${appName}`;
}

/**
 * List of available frameworks
 */
export const availableFrameworks = [
    { name: 'Hono - Lightweight framework for APIs', value: 'hono' },
    { name: 'React with Vite - For frontend apps', value: 'react-vite' },
    { name: 'Astro with Vite - For static sites', value: 'astro-vite' },
    {
        name: 'TanStack Start - Full-stack React framework with SSR, streaming & more',
        value: 'tanstack-start',
    },
];
