import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary.js';
import { NotFound } from './components/NotFound.js';
import { routeTree } from './routeTree.gen.js';

export function createRouter() {
    const router = createTanStackRouter({
        routeTree,
        defaultPreload: 'intent',
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        scrollRestoration: true
    });

    return router;
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
