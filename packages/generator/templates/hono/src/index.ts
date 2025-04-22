import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Crear la aplicación Hono
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Rutas
app.get('/', (c) => {
    return c.json({
        message: 'Bienvenido a la API de {{appName}}',
        framework: 'Hono',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/hello', (c) => {
    return c.json({
        message: '¡Hola desde {{appName}}!',
        framework: 'Hono',
    });
});

// Iniciar el servidor
const port = process.env.PORT || 3000;

if (import.meta.env?.PROD) {
    console.log(`Servidor iniciado en http://localhost:${port}`);
}

export default {
    port,
    fetch: app.fetch,
};
