import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import fs from 'fs-extra';

// Get the directory where the port tracking file will be stored
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT_TRACKING_FILE = path.join(__dirname, '..', '..', '.ports.json');

// Default starting port
const DEFAULT_START_PORT = 4000;

/**
 * Port tracking interface
 */
interface PortTracking {
    usedPorts: Record<string, number>;
    lastAssignedPort: number;
}

/**
 * Loads the port tracking data
 * @returns Port tracking data
 */
export async function loadPortTracking(): Promise<PortTracking> {
    try {
        if (await fs.pathExists(PORT_TRACKING_FILE)) {
            const data = await fs.readJson(PORT_TRACKING_FILE);
            return {
                usedPorts: data.usedPorts || {},
                lastAssignedPort: data.lastAssignedPort || DEFAULT_START_PORT,
            };
        }
    } catch (error) {
        logger.warn('Failed to load port tracking data, using defaults', {
            subtitle: 'This will not affect the app generation process',
        });
    }

    return {
        usedPorts: {},
        lastAssignedPort: DEFAULT_START_PORT,
    };
}

/**
 * Saves the port tracking data
 * @param data Port tracking data
 */
export async function savePortTracking(data: PortTracking): Promise<void> {
    try {
        await fs.ensureDir(path.dirname(PORT_TRACKING_FILE));
        await fs.writeJson(PORT_TRACKING_FILE, data, { spaces: 2 });
    } catch (error) {
        logger.warn('Failed to save port tracking data', {
            subtitle: 'Port suggestions may not be accurate in future runs',
        });
    }
}

/**
 * Gets the next available port
 * @returns Next available port
 */
export async function getNextAvailablePort(): Promise<number> {
    const portTracking = await loadPortTracking();
    const nextPort = portTracking.lastAssignedPort + 1;
    return nextPort;
}

/**
 * Registers a port as used by an app
 * @param appName App name
 * @param port Port number
 */
export async function registerPort(appName: string, port: number): Promise<void> {
    const portTracking = await loadPortTracking();

    // Update the tracking data
    portTracking.usedPorts[appName] = port;
    portTracking.lastAssignedPort = Math.max(portTracking.lastAssignedPort, port);

    // Save the updated tracking data
    await savePortTracking(portTracking);

    logger.info(`Port ${port} registered for app ${appName}`, {
        icon: '🔌',
        title: 'PORT',
    });
}

/**
 * Gets all used ports
 * @returns Record of app names and their ports
 */
export async function getUsedPorts(): Promise<Record<string, number>> {
    const portTracking = await loadPortTracking();
    return portTracking.usedPorts;
}

/**
 * Checks if a port is already in use
 * @param port Port number to check
 * @returns true if the port is already in use, false otherwise
 */
export async function isPortInUse(port: number): Promise<boolean> {
    const portTracking = await loadPortTracking();
    return Object.values(portTracking.usedPorts).includes(port);
}
