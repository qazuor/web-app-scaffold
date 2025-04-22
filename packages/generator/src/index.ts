#!/usr/bin/env node
import { program } from 'commander';
import { setupCLI } from './cli.js';
import { runGenerator } from './generator.js';
import { logger } from './utils/logger.js';

// Generator version
const version = '0.1.0';

async function main() {
    try {
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
