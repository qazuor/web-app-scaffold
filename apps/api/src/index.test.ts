// apps/api/src/index.test.ts
import { describe, expect, it } from 'vitest';
import app from './index'; // Importa la instancia de Hono

describe('Hono API', () => {
    it('should return "Hello from Hono API!" on GET /', async () => {
        const res = await app.request('http://localhost/'); // Usa app.request para testing

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Hello from Hono API!');
    });

    it('should return "Hello, Alice!" on GET /hello/Alice', async () => {
        const res = await app.request('http://localhost/hello/Alice');

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Hello, Alice!');
    });

    it('should echo the JSON body on POST /echo', async () => {
        const testBody = { data: 'example', number: 123 };
        const res = await app.request('http://localhost/echo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBody),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(testBody);
    });
});
