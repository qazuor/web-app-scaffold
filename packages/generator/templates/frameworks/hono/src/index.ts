import { serve } from '@hono/node-server';
import { type Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const port = process.env.PORT || 4001;
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Simple logging middleware
app.use('*', async (c: Context, next: () => Promise<void>) => {
    console.log(`${c.req.method} ${c.req.url}`);
    await next();
});

// CORS middleware
const origin = [`http://localhost:${port}`]; // Allow only these origins in development
if (process.env.CORS_HOST) {
    origin.push(process.env.CORS_HOST);
}
app.use(
    '//*',
    cors({
        // <-- Use CORS middleware for all routes
        origin: origin,
        allowHeaders: ['Content-Type', 'Authorization'], // Add the headers your frontend might send
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add the methods your frontend might use
        exposeHeaders: ['Content-Length'], // Headers exposed to the frontend
        maxAge: 600, // Cache preflight response for 10 minutes
        credentials: true, // Allow cookies/auth headers if your frontend sends them
    }),
);

// Basic welcome route
app.get('/', (c: Context) => {
    return c.json({ message: 'Hello from Hono API!' });
});

// Example route with parameter
app.get('/hello/:name', (c: Context) => {
    const name = c.req.param('name');
    return c.json({ message: `Hello, ${name}!` });
});

// Example POST route
app.post('/echo', async (c: Context) => {
    const body = await c.req.json();
    return c.json(body);
});

if (process.env.NODE_ENV === 'development') {
    console.log(`Server is running on http://localhost:${port}`);
    serve({
        fetch: app.fetch,
        port,
    });
} else {
    console.log(`Server started at ${process.env.HOST}:${port}`);
}

export default {
    port,
    fetch: app.fetch,
};
