import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/hello')({
    // This route runs on the server
    method: 'get',
    handler: async () => {
        // Simulate a database or external API operation
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
            message: 'Hello from {{appName}} API!',
            timestamp: new Date().toISOString(),
        };
    },
});
