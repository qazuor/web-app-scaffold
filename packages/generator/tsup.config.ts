import { execa } from 'execa';
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    splitting: false,
    dts: false,
    clean: true,
    sourcemap: true,
    target: 'node18',
    outDir: 'dist',
    async onSuccess() {
        // Copy only templates
        await execa('cp', ['-r', 'templates', 'dist']);
    },
    esbuildOptions(options) {
        options.bundle = true;
        options.platform = 'node';
        options.format = 'esm';
        options.external = [];
        options.sourcemap = true;
    }
});
