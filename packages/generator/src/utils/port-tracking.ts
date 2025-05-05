import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT_TRACKING_FILE = path.join(__dirname, '../..', '../..', 'apps.ports.json');
const DEFAULT_START_PORT = 4000;

interface PortTracking {
    usedPorts: Record<string, number>;
    lastAssignedPort: number;
}

/**
 * Loads the port tracking data
 */
export async function loadPortTracking(): Promise<PortTracking> {
    try {
        if (await fs.pathExists(PORT_TRACKING_FILE)) {
            const data = await fs.readJson(PORT_TRACKING_FILE);
            return {
                usedPorts: data.usedPorts || {},
                lastAssignedPort: data.lastAssignedPort || DEFAULT_START_PORT
            };
        }
    } catch (error) {
        logger.warn('Failed to load port tracking data, using defaults');
        logger.debug(error as Error);
    }

    return {
        usedPorts: {},
        lastAssignedPort: DEFAULT_START_PORT
    };
}

/**
 * Gets the next available port
 */
export async function getNextAvailablePort(): Promise<number> {
    const portTracking = await loadPortTracking();
    return portTracking.lastAssignedPort + 1;
}

/**
 * Registers a port as used by an app
 */
export async function registerPort(appName: string, port: number): Promise<void> {
    const portTracking = await loadPortTracking();
    portTracking.usedPorts[appName] = port;
    portTracking.lastAssignedPort = Math.max(portTracking.lastAssignedPort, port);

    await fs.ensureDir(path.dirname(PORT_TRACKING_FILE));
    await fs.writeJson(PORT_TRACKING_FILE, portTracking, { spaces: 2 });

    logger.info(`Port ${port} registered for app ${appName}`, {
        icon: '🔌',
        title: 'PORT'
    });
}

/**
 * Checks if a port is already in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
    const portTracking = await loadPortTracking();
    return Object.values(portTracking.usedPorts).includes(port);
}
