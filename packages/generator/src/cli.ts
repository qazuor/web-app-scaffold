import type { Command } from 'commander';

/**
 * Sets up the command-line interface
 * @param program Commander instance
 * @param version Generator version
 */
export function setupCLI(program: Command, version: string): void {
    program
        .version(version)
        .description('🚀 Qazuor App Generator for Turborepo')
        .option('-n, --name <name>', 'Application name')
        .option('-f, --framework <framework>', 'Framework to use')
        .option('-d, --description <description>', 'Application description')
        .option('-p, --port <port>', 'Port number for the application', Number.parseInt)
        .option('-i, --install', 'Automatically install dependencies');
}
