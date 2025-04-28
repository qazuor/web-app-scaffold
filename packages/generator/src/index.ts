#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@repo/logger';
import { program } from 'commander';
import fs from 'fs-extra';
import { Generator } from './Generator.js';
import { setupCLI } from './cli.js';
import type { GeneratorOptions } from './types/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCompiledCode = __dirname.includes('dist');
const templatesDir = path.join(__dirname, isCompiledCode ? '..' : '..', 'templates');

async function main() {
    try {
        // Print Initial Banner
        console.clear();
        logger.banner('Qazuor App Generator', 'For Turborepo Monorepos', 'ANSI Regular');

        // Validate templates directory
        if (!(await fs.pathExists(templatesDir))) {
            logger.error('Templates directory not found. Cannot continue.', {
                subtitle: 'Please make sure the templates directory exists.'
            });
            process.exit(1);
        }

        // Set up CLI
        setupCLI(program, '0.1.0');
        program.parse(process.argv);
        const options = program.opts();

        // Run generator
        const generator = new Generator(templatesDir);
        await generator.run(options as GeneratorOptions);
    } catch (err) {
        logger.error('Unexpected error:', { subtitle: String(err) });
        logger.debug(err as Error);
        process.exit(1);
    }
}

// Run the application
main();
