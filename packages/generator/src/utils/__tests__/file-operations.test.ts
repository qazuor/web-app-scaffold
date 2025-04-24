import * as path from 'node:path';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    copyDirectory,
    createDirectory,
    processDirectory,
    updatePackageJson,
    updatePortInConfigs
} from '../file-operations';

// Mock dependencies
vi.mock('fs-extra');
vi.mock('@repo/logger');
vi.mock('node:path');

describe('File Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Set up path mocks for each test
        vi.mocked(path.relative).mockImplementation((from, to) => {
            if (to === '/test/dir') return 'dir';
            if (to === '/test/package.json') return 'package.json';
            if (to === '/test/app') return 'app';
            return to;
        });

        vi.mocked(path.basename).mockImplementation((p) => p.split('/').pop() || '');
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('createDirectory', () => {
        it('should create directory and log success', async () => {
            const dirPath = '/test/dir';

            await createDirectory(dirPath);

            expect(fs.ensureDir).toHaveBeenCalledWith(dirPath);
            expect(logger.directory).toHaveBeenCalledWith('Creating folder:', 'dir');
        });
    });

    describe('copyDirectory', () => {
        it('should copy directory and log success', async () => {
            const sourcePath = '/source/dir';
            const destPath = '/dest/dir';

            await copyDirectory(sourcePath, destPath);

            expect(fs.copy).toHaveBeenCalledWith(sourcePath, destPath);
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Copying'),
                expect.objectContaining({
                    icon: '📋',
                    title: 'TEMPLATE'
                })
            );
        });
    });

    describe('updatePackageJson', () => {
        it('should update package.json with new values', async () => {
            const packageJsonPath = '/test/package.json';
            const updates = { name: 'test-app', version: '1.0.0' };
            const existingContent = { name: 'old-name', version: '0.0.1' };

            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(existingContent);

            await updatePackageJson(packageJsonPath, updates);

            expect(fs.writeJson).toHaveBeenCalledWith(
                packageJsonPath,
                { ...existingContent, ...updates },
                { spaces: 4 }
            );
            expect(logger.file).toHaveBeenCalledWith(
                'Updating',
                'package.json',
                expect.objectContaining({ icon: '📝' })
            );
        });
    });

    describe('updatePortInConfigs', () => {
        it('should update port in React Vite config', async () => {
            const appDir = '/test/app';
            const framework = 'react-vite';
            const port = 3001;
            const viteConfigPath = path.join(appDir, 'vite.config.ts');
            const configContent = 'export default defineConfig({ server: { port: 3000 } });';

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readFile').mockResolvedValue(configContent);
            vi.spyOn(fs, 'writeFile').mockResolvedValue();

            await updatePortInConfigs(appDir, framework, port);

            expect(fs.writeFile).toHaveBeenCalledWith(
                viteConfigPath,
                expect.stringContaining('port: 3001')
            );
            expect(logger.info).toHaveBeenCalledWith(
                'Setting port to 3001 in configuration files',
                expect.objectContaining({ icon: '🔌' })
            );
            expect(logger.success).toHaveBeenCalledWith('Port configuration updated to 3001');
        });
    });

    describe('processDirectory', () => {
        it('should process files in directory', async () => {
            const dirPath = '/test/app';
            const basePath = '/test';
            const mockFiles = [
                {
                    name: 'test.json',
                    isDirectory: vi.fn().mockReturnValue(false),
                    isFile: vi.fn().mockReturnValue(true)
                }
            ];

            const fullPath = path.join(dirPath, 'test.json');

            vi.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
            vi.spyOn(fs, 'readFile').mockResolvedValue('{{appName}}');
            vi.spyOn(fs, 'writeFile').mockResolvedValue();

            // Mock path.relative to return './' for this specific case
            vi.mocked(path.relative).mockImplementation((from, to) => {
                if (from === basePath && to === dirPath) return './';
                return path.join(from, to);
            });

            await processDirectory(
                dirPath,
                'test-app',
                'react-vite',
                'Test description',
                basePath,
                3001
            );

            expect(fs.readdir).toHaveBeenCalledWith(dirPath, { withFileTypes: true });
            expect(logger.directory).toHaveBeenCalledWith('Processing directory:', './');
            expect(fs.writeFile).toHaveBeenCalledWith(fullPath, 'test-app', 'utf8');
            expect(logger.success).toHaveBeenCalledWith(
                expect.stringContaining('Replacing placeholders'),
                expect.objectContaining({
                    icon: '✏️',
                    title: 'UPDATED'
                })
            );
        });
    });
});
