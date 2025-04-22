#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Versión del generador
const version = '0.1.0';

// Configuración del CLI
program
    .version(version)
    .description('Generador de Qazuor de aplicaciones para monorepo Turborepo')
    .option('-n, --name <name>', 'Nombre de la aplicación')
    .option('-f, --framework <framework>', 'Framework a utilizar')
    .option('-d, --description <description>', 'Descripción de la aplicación')
    .parse(process.argv);

const options = program.opts();

// Función para obtener un nombre predeterminado basado en el framework
function getDefaultNameForFramework(framework: string): string {
    const frameworkMap: Record<string, string> = {
        hono: 'api',
        'react-vite': 'web',
        'astro-vite': 'site',
        'tanstack-start': 'app',
    };

    return frameworkMap[framework] || 'my-app';
}

// Función para obtener una descripción predeterminada basada en el framework
function getDefaultDescriptionForFramework(framework: string, appName: string): string {
    const frameworkMap: Record<string, string> = {
        hono: `API REST construida con Hono para ${appName}`,
        'react-vite': `Aplicación web React construida con Vite para ${appName}`,
        'astro-vite': `Sitio web estático construido con Astro para ${appName}`,
        'tanstack-start': `Aplicación full-stack construida con TanStack Start para ${appName}`,
    };

    return frameworkMap[framework] || `Aplicación ${appName}`;
}

// Función principal
async function main() {
    console.log(chalk.blue('🚀 Generador de Apps para Turborepo'));
    console.log(chalk.gray('-----------------------------------'));

    // Primero preguntar por el framework a utilizar
    const frameworkAnswers = await inquirer.prompt([
        {
            type: 'list',
            name: 'framework',
            message: '¿Qué framework deseas utilizar?',
            default: options.framework,
            when: !options.framework,
            choices: [
                { name: 'Hono - Framework ligero para APIs', value: 'hono' },
                { name: 'React con Vite - Para aplicaciones frontend', value: 'react-vite' },
                { name: 'Astro con Vite - Para sitios web estáticos', value: 'astro-vite' },
                {
                    name: 'TanStack Start - Framework full-stack React con SSR, streaming y más',
                    value: 'tanstack-start',
                },
            ],
        },
    ]);

    const framework = options.framework || frameworkAnswers.framework;

    // Luego preguntar por el nombre de la app con un valor predeterminado basado en el framework
    const nameAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Nombre de la aplicación:',
            default: getDefaultNameForFramework(framework),
            when: !options.name,
            validate: (input) => {
                if (/^[a-z0-9-]+$/.test(input)) return true;
                return 'El nombre debe contener solo letras minúsculas, números y guiones';
            },
        },
    ]);

    const appName = options.name || nameAnswers.name;

    // Preguntar por la descripción de la aplicación
    const descriptionAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'description',
            message: 'Descripción de la aplicación:',
            default: getDefaultDescriptionForFramework(framework, appName),
            when: !options.description,
        },
    ]);

    const description = options.description || descriptionAnswers.description;

    // Crear la aplicación
    try {
        await createApp(appName, framework, description);
        console.log(
            chalk.green(`✅ Aplicación "${appName}" creada exitosamente con ${framework}!`),
        );
        console.log(chalk.yellow('\nPróximos pasos:'));
        console.log(`  1. Navega a la carpeta: ${chalk.cyan(`cd apps/${appName}`)}`);
        console.log(`  2. Instala dependencias: ${chalk.cyan('pnpm install')}`);

        if (framework === 'tanstack-start') {
            console.log(`  3. Inicia el servidor de desarrollo: ${chalk.cyan('pnpm dev')}`);
            console.log(`  4. Visita: ${chalk.cyan('http://localhost:3000')}`);
            console.log(`  5. Explora la API en: ${chalk.cyan('http://localhost:3000/api/hello')}`);
            console.log(
                `\n${chalk.blue('ℹ️ Nota:')} TanStack Start está en beta. Consulta la documentación oficial en ${chalk.cyan(
                    'https://tanstack.com/start/latest',
                )}`,
            );
        } else {
            console.log(`  3. Inicia el servidor de desarrollo: ${chalk.cyan('pnpm dev')}`);
            console.log(`  4. Ejecuta el linter con Biome: ${chalk.cyan('pnpm lint')}`);
            console.log(`  5. Formatea el código con Biome: ${chalk.cyan('pnpm format')}`);
        }
    } catch (error) {
        console.error(chalk.red('❌ Error al crear la aplicación:'), error);
        process.exit(1);
    }
}

// Función para crear la aplicación
async function createApp(name: string, framework: string, description: string) {
    const appDir = path.join(process.cwd(), 'apps', name);
    const templateDir = path.join(__dirname, '../templates', framework);

    // Verificar si la carpeta ya existe
    if (fs.existsSync(appDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `La carpeta apps/${name} ya existe. ¿Deseas sobrescribirla?`,
                default: false,
            },
        ]);

        if (!overwrite) {
            console.log(chalk.yellow('⚠️ Operación cancelada.'));
            process.exit(0);
        }

        await fs.remove(appDir);
    }

    // Crear la carpeta de la app
    await fs.ensureDir(appDir);

    // Copiar la plantilla
    await fs.copy(templateDir, appDir);

    // Reemplazar placeholders en los archivos
    await processDirectory(appDir, name, framework, description);

    // Actualizar package.json
    const packageJsonPath = path.join(appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = `@${name}/app`;
        packageJson.description = description;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // Instrucciones específicas para TanStack Start
    if (framework === 'tanstack-start') {
        console.log(chalk.blue('\nConfigurando TanStack Start...'));
        console.log(
            chalk.gray(
                "TanStack Start generará automáticamente el archivo routeTree.gen.ts cuando ejecutes 'pnpm dev' por primera vez.",
            ),
        );
    }
}

// Función para procesar directorios recursivamente
async function processDirectory(
    dirPath: string,
    appName: string,
    framework: string,
    description: string,
) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Procesar subdirectorios recursivamente
            await processDirectory(fullPath, appName, framework, description);
        } else if (entry.isFile()) {
            // Procesar archivos
            try {
                const content = await fs.readFile(fullPath, 'utf8');
                const newContent = content
                    .replace(/{{appName}}/g, appName)
                    .replace(/{{framework}}/g, framework)
                    .replace(/{{description}}/g, description);

                await fs.writeFile(fullPath, newContent);
            } catch (error) {
                console.warn(chalk.yellow(`⚠️ No se pudo procesar el archivo: ${fullPath}`));
                // Continuar con el siguiente archivo
            }
        }
    }
}

main().catch((err) => {
    console.error(chalk.red('Error inesperado:'), err);
    process.exit(1);
});
