import path from 'node:path';
import { logger } from '@repo/logger';
import fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PackageConfig } from '../../types/package';
import { addSelectedPackages, updateEnvVars, updateReadme } from '../package-manager.js';

vi.mock('fs-extra');
vi.mock('@repo/logger');
vi.mock('node:path');

describe('Package Manager', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock path.join to return predictable paths
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    });

    const appDir = '/test/app';

    const mockPackageConfig: PackageConfig = {
        name: 'test-package',
        displayName: 'Test Package',
        description: 'Test package description',
        version: '1.0.0',
        dependencies: ['dep1@1.0.0'],
        devDependencies: ['dev-dep1@1.0.0'],
        readmeSection: 'Test package readme section\n\n'
    };

    const mockApp: PackageConfig = {
        appDir: appDir,
        appName: 'test-app',
        framework: 'testFramework',
        description: 'test description',
        port: 123,
        uiLibrary: null,
        iconLibrary: null,
        selectedPackages: [mockPackageConfig]
    };

    describe('addSelectedPackages', () => {
        it('should add packages to package.json', async () => {
            const packageJsonPath = path.join(appDir, 'package.json');
            const packageJson = {
                dependencies: {},
                devDependencies: {}
            };

            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(packageJson);
            vi.spyOn(fs, 'writeJson').mockResolvedValue();

            await addSelectedPackages(
                mockApp.appDir,
                mockApp.appName,
                mockApp.framework,
                mockApp.description,
                mockApp.port,
                mockApp.uiLibrary,
                mockApp.iconLibrary,
                mockApp.selectedPackages
            );

            expect(fs.writeJson).toHaveBeenCalledWith(
                packageJsonPath,
                expect.objectContaining({
                    dependencies: { 'test-package': '1.0.0', dep1: '1.0.0' },
                    devDependencies: { 'dev-dep1': '1.0.0' }
                }),
                { spaces: 4 }
            );
        });
    });

    describe('updateEnvVars', () => {
        it('should update environment variables in .env files', async () => {
            const packages = [
                {
                    ...mockPackageConfig,
                    envVars: {
                        TEST_VAR: 'test-value'
                    }
                }
            ];

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readFile').mockResolvedValue('');
            vi.spyOn(fs, 'writeFile').mockResolvedValue();

            await updateEnvVars(appDir, packages);

            expect(fs.writeFile).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('TEST_VAR=test-value')
            );
        });
    });

    describe('updateReadme', () => {
        it('should update README.md with package information', async () => {
            const readmePath = path.join(appDir, 'README.md');
            const packages = [mockPackageConfig];
            const appName = 'test-app';
            const initialContent = '# Test app README';
            const expectedContent = `# Test app README\n\n## Installed Packages\n\nThis project includes the following packages:\n\n- **Test Package**: Test package description\n\n${mockPackageConfig.readmeSection}\n`;

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readFile').mockResolvedValue(initialContent);
            vi.spyOn(fs, 'writeFile').mockResolvedValue();

            await updateReadme(appDir, packages, appName);
            expect(fs.writeFile).toHaveBeenCalledWith(readmePath, expectedContent, 'utf8');
        });

        it('should handle missing README.md gracefully', async () => {
            const appDir = '/test/app';
            const packages = [mockPackageConfig];
            const appName = 'test-app';

            vi.spyOn(fs, 'pathExists').mockResolvedValue(false);

            await updateReadme(appDir, packages, appName);

            expect(logger.warn).toHaveBeenCalledWith('README.md not found, skipping update');
        });
    });
});
