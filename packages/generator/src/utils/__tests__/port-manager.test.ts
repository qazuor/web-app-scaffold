import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPortInUse, loadPortTracking, registerPort } from '../port-manager';

vi.mock('fs-extra');

describe('Port Manager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('loadPortTracking', () => {
        it('should load port tracking data from file', async () => {
            const mockData = {
                usedPorts: { app1: 3000 },
                lastAssignedPort: 3000,
            };

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(mockData);

            const result = await loadPortTracking();
            expect(result).toEqual(mockData);
        });

        it('should return default values if file does not exist', async () => {
            vi.spyOn(fs, 'pathExists').mockResolvedValue(false);

            const result = await loadPortTracking();
            expect(result).toEqual({
                usedPorts: {},
                lastAssignedPort: 4000,
            });
        });
    });

    describe('registerPort', () => {
        it('should register a port for an app', async () => {
            const mockData = {
                usedPorts: {},
                lastAssignedPort: 3000,
            };

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(mockData);
            vi.spyOn(fs, 'writeJson').mockResolvedValue();

            await registerPort('testApp', 3001);

            expect(fs.writeJson).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    usedPorts: { testApp: 3001 },
                    lastAssignedPort: 3001,
                }),
                expect.any(Object),
            );
        });
    });

    describe('isPortInUse', () => {
        it('should return true if port is in use', async () => {
            const mockData = {
                usedPorts: { app1: 3000 },
                lastAssignedPort: 3000,
            };

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(mockData);

            const result = await isPortInUse(3000);
            expect(result).toBe(true);
        });

        it('should return false if port is not in use', async () => {
            const mockData = {
                usedPorts: { app1: 3000 },
                lastAssignedPort: 3000,
            };

            vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
            vi.spyOn(fs, 'readJson').mockResolvedValue(mockData);

            const result = await isPortInUse(3001);
            expect(result).toBe(false);
        });
    });
});
