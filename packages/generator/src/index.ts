#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import { program } from 'commander';
import fs from 'fs-extra';
import { setupCLI } from './cli.js';
import { runGenerator } from './generator.js';
import { printBanner } from './utils/banner.js';

// Generator version
const version = '0.1.0';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine if we're running from compiled code
const isCompiledCode = __dirname.includes('dist');

// Determine the templates directory
const templatesDir = path.join(__dirname, isCompiledCode ? '..' : '..', 'templates/frameworks');

// Global variable to store templates directory
global.templatesDir = templatesDir;

async function main() {
    try {
        // Print a simple banner instead of using figlet
        printBanner('Qazuor App Generator', 'For Turborepo Monorepos');

        // Comprobar si el directorio de plantillas existe
        const templatesExist = await fs.pathExists(templatesDir);
        if (!templatesExist) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.'
            });
            process.exit(1);
        }

        // Set up the CLI
        setupCLI(program, version);
        program.parse(process.argv);
        const options = program.opts();

        // Run the generator
        await runGenerator(options);
    } catch (err) {
        logger.error('Unexpected error:', { subtitle: String(err) });
        logger.debug(err as Error);
        process.exit(1);
    }
}

// Run the application
main();
