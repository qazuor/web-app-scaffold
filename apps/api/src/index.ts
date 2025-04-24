import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware de logging simple
app.use('*', async (c, next) => {
    console.log(`${c.req.method} ${c.req.url}`);
    await next();
});

// Middleware de CORS
app.use(
    '//*',
    cors({
        // <-- Usa el middleware de CORS para todas las rutas
        origin: ['http://localhost:5173'], // Permite solo este origen en desarrollo
        allowHeaders: ['Content-Type', 'Authorization'], // Añade los encabezados que tu frontend pueda enviar
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Añade los métodos que tu frontend pueda usar
        exposeHeaders: ['Content-Length'], // Encabezados a exponer al frontend
        maxAge: 600, // Cachea la respuesta preflight por 10 minutos
        credentials: true // Permite enviar cookies/auth headers si tu frontend los usa
    })
);

// Ruta básica de bienvenida
app.get('/', (c) => {
    return c.json({ message: 'Hello from Hono API!' });
});

// Ruta de ejemplo con parámetro
app.get('/hello/:name', (c) => {
    const name = c.req.param('name');
    return c.json({ message: `Hello, ${name}!` });
});

// Ruta de ejemplo POST
app.post('/echo', async (c) => {
    const body = await c.req.json();
    return c.json(body);
});

export default app;

if (process.env.NODE_ENV === 'development') {
    const port = 3001;
    console.log(`Server is running on http://localhost:${port}`);
    serve({
        fetch: app.fetch,
        port
    });
}
