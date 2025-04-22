import baseConfig from '@repo/config/vitest.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            environment: 'node',
        },
    }),
);
