#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import fs from 'fs-extra';
import { setupCLI } from './cli.js';
import { runGenerator } from './generator.js';
import { printBanner } from './utils/banner.js';
import { logger } from './utils/logger.js';

// Generator version
const version = '0.1.0';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine if we're running from compiled code
const isCompiledCode = __dirname.includes('dist');

// Determine the templates directory
let templatesDir = path.join(__dirname, isCompiledCode ? '..' : '..', 'templates');

// Global variable to store templates directory
global.templatesDir = templatesDir;

// Función para buscar el directorio de plantillas
async function findTemplatesDir() {
    // Comprobar si el directorio de plantillas existe
    if (await fs.pathExists(templatesDir)) {
        return templatesDir;
    }

    // Posibles ubicaciones alternativas
    const alternatives = [
        path.join(__dirname, 'templates'),
        path.join(__dirname, '..', 'templates'),
        path.join(__dirname, '..', '..', 'templates'),
        path.join(process.cwd(), 'templates'),
        path.join(process.cwd(), 'packages', 'generator', 'templates'),
    ];

    for (const dir of alternatives) {
        if (await fs.pathExists(dir)) {
            logger.success(`Found templates directory at: ${dir}`, { icon: '🔍' });
            return dir;
        }
    }

    // Si no se encuentra, devolver el valor original
    return templatesDir;
}

async function main() {
    try {
        // Print a simple banner instead of using figlet
        printBanner('Qazuor App Generator', 'For Turborepo Monorepos');

        // Log some debug information
        logger.info(`Current directory: ${__dirname}`, { icon: '🔍' });
        logger.info(`Running from: ${process.cwd()}`, { icon: '🔍' });
        logger.info(`Is compiled code: ${isCompiledCode}`, { icon: '🔍' });

        // Buscar el directorio de plantillas
        templatesDir = await findTemplatesDir();
        global.templatesDir = templatesDir;
        logger.info(`Templates directory: ${templatesDir}`, { icon: '🔍' });

        // Comprobar si el directorio de plantillas existe
        const templatesExist = await fs.pathExists(templatesDir);
        logger.info(`Templates directory exists: ${templatesExist ? 'yes' : 'no'}`, { icon: '🔍' });

        if (!templatesExist) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.',
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
        process.exit(1);
    }
}

// Run the application
main();
