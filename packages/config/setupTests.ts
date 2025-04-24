import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Example: Mocking fetch API calls
// const server = setupServer(
//   rest.get('http://localhost:3001/', (req, res, ctx) => {
//     return res(ctx.json({ message: 'Mock API Message' }));
//   })
//   // Add other handlers here
// );

// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// Mocking fetch simple si no usas msw
global.fetch = () =>
    Promise.resolve({
        json: () => Promise.resolve({ message: 'Mock API Message' }),
        ok: true,
        status: 200
        // Add other properties needed by the fetch API if necessary
    } as Response); // Type assertion for simplicity in mock

// Mock environment variables
vi.stubGlobal('import.meta', {
    env: {
        VITE_APP_TITLE: 'My React App'
    }
});
