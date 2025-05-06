import { describe, expect, it } from 'vitest';
import app from '../index';

describe('Hono API', () => {
    it('should return welcome message on GET /', async () => {
        const res = await app.request('http://localhost/');
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toEqual({ message: 'Welcome to Hono API!' });
    });

    it('should return personalized greeting on GET /hello/:name', async () => {
        const res = await app.request('http://localhost/hello/Alice');
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toEqual({ message: 'Hello, Alice!' });
    });

    it('should echo POST body on /echo', async () => {
        const testBody = { test: 'data', number: 123 };
        const res = await app.request('http://localhost/echo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBody)
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual(testBody);
    });
});
