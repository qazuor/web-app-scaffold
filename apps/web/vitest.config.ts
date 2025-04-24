import baseConfig from '@repo/config/vitest.config';
import { defineConfig, mergeConfig } from 'vite';

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            globals: true
        }
    })
);
