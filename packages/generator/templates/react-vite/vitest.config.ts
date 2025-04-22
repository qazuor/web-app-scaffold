import baseConfig from '@repo/config/vitest.config';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        plugins: [react()],
        test: {
            environment: 'jsdom',
        },
    }),
);
