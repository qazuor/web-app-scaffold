import path from 'node:path';
import { logger } from '@repo/logger';
import fs from 'fs-extra';

const TRACKING_FILE = path.join(process.cwd(), '.app-generator/apps.json');
const DEFAULT_START_PORT = 4000;

export type CreatedApp = {
    name: string;
    port: number;
    createdAt: string;
    updatedAt: string;
    framework: string;
    sharedPackages: string[];
};

export type SharedPackage = {
    name: string;
    createdAt: string;
    updatedAt: string;
    basePackage: string;
    usedBy: string[];
};

export interface DataTracking {
    usedPorts: Record<string, number>;
    lastAssignedPort: number;
    createdApps: CreatedApp[];
    sharedPackages: SharedPackage[];
}

/**
 * Loads the port tracking data
 */
export async function loadTrackingData(): Promise<DataTracking> {
    const defaults: DataTracking = {
        usedPorts: {},
        lastAssignedPort: DEFAULT_START_PORT,
        createdApps: [],
        sharedPackages: []
    };
    try {
        if (await fs.pathExists(TRACKING_FILE)) {
            try {
                const data = await fs.readJson(TRACKING_FILE);
                return {
                    usedPorts: data.usedPorts || {},
                    lastAssignedPort: data.lastAssignedPort || DEFAULT_START_PORT,
                    createdApps: data.createdApps || [],
                    sharedPackages: data.sharedPackages || []
                };
            } catch (_error) {
                logger.warn('Failed to load tracking data, using defaults');
                return defaults;
            }
        }
    } catch (_error) {
        logger.warn('Failed to load tracking data, using defaults');
    }

    return defaults;
}

/**
 * Gets the next available port
 */
export async function getNextAvailablePort(): Promise<number> {
    const trackingData = await loadTrackingData();
    return trackingData.lastAssignedPort + 1;
}

/**
 * Registers a port as used by an app
 */
export async function registerPort(appName: string, port: number): Promise<void> {
    const trackingData = await loadTrackingData();
    trackingData.usedPorts[appName] = port;
    trackingData.lastAssignedPort = Math.max(trackingData.lastAssignedPort, port);

    await writeTrackingDSataToFile(trackingData);

    logger.info(`Port ${port} registered for app ${appName}`, {
        icon: '🔌',
        title: 'PORT'
    });
}

/**
 * Registers a shared package
 */
export async function registerApp(app: CreatedApp): Promise<void> {
    const trackingData = await loadTrackingData();
    app.createdAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();
    trackingData.createdApps.push(app);
    await writeTrackingDSataToFile(trackingData);

    logger.info(`App ${app.name} (${app.framework}) registered in port ${app.port}`, {
        icon: '🔌',
        title: 'APP'
    });
}

/**
 * Registers a shared package
 */
export async function registerSharedPackage(
    appName: string,
    sharedPackage: SharedPackage
): Promise<void> {
    const trackingData = await loadTrackingData();
    sharedPackage.usedBy = [appName];
    sharedPackage.createdAt = new Date().toISOString();
    sharedPackage.updatedAt = new Date().toISOString();
    trackingData.sharedPackages.push(sharedPackage);
    await writeTrackingDSataToFile(trackingData);

    logger.info(
        `Shared package ${sharedPackage.name} (${sharedPackage.basePackage}) registered for app ${appName}`,
        {
            icon: '🔌',
            title: 'SHARED PACKAGE'
        }
    );
}

/**
 * Checks if a port is already in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
    const trackingData = await loadTrackingData();
    return Object.values(trackingData.usedPorts).includes(port);
}

/**
 * Checks if a shared package is already created
 */
export async function sharedPackageExists(basePackage: string): Promise<boolean> {
    const trackingData = await loadTrackingData();
    return Object.values(
        trackingData.sharedPackages.map((sharedPackage) => sharedPackage.basePackage)
    ).includes(basePackage);
}

/**
 * get shared package by base package
 */
export async function getSharedPackageByBasePackage(
    basePackage: string
): Promise<SharedPackage | undefined> {
    const trackingData = await loadTrackingData();
    return trackingData.sharedPackages?.find(
        (sharedPackage) => sharedPackage.basePackage === basePackage
    );
}

/**
 * Write trakking data to file
 */
export async function writeTrackingDSataToFile(newData: DataTracking): Promise<void> {
    const oldTrackingData = await loadTrackingData();
    const mergedData = Object.assign({}, oldTrackingData, newData);
    await fs.ensureDir(path.dirname(TRACKING_FILE));
    await fs.writeJson(TRACKING_FILE, mergedData, { spaces: 4 });
}
