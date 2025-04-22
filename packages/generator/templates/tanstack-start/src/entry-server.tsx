import { createRouter } from '@tanstack/react-router';
import { StartServer } from '@tanstack/start/server';
import { routeTree } from './routeTree.gen';

// Create the router
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Start the server
new StartServer({
    router,
});
