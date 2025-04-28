#!/usr/bin/env node
import { logger } from '@repo/logger';
import { program } from 'commander';

import { Generator } from './Generator.js';
import { setupCLI } from './cli.js';
import { ConfigsManager } from './core/ConfigsManager.js';
import type { GeneratorOptions } from './types/generator.js';

async function main() {
    try {
        // Print Initial Banner
        console.clear();
        logger.banner('Qazuor App Generator', 'For Turborepo Monorepos', 'ANSI Regular');

        // Set up CLI
        setupCLI(program, '0.1.0');
        program.parse(process.argv);
        const options = program.opts() as GeneratorOptions;

        const configsManager = new ConfigsManager(options);
        await configsManager.validatePaths();

        // Run generator
        const generator = new Generator(configsManager);
        await generator.run();
    } catch (err) {
        logger.error('Unexpected error:', { subtitle: String(err) });
        logger.debug(err as Error);
        process.exit(1);
    }
}

// Run the application
main();
