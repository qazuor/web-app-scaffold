import react from '@vitejs/plugin-react'; // Para soporte de JSX en Vitest
// packages/config/vitest.config.ts
import { defineConfig } from 'vitest/config';

// Esta es una configuración base que otros proyectos pueden extender
export default defineConfig({
    plugins: [react()], // Habilita plugins si son necesarios globalmente (como el de React)
    test: {
        // Configuraciones de Vitest que se aplican a menos que se sobrescriban
        globals: true, // Hace que las APIs de Vitest (describe, it, expect) estén disponibles globalmente
        environment: 'node', // Entorno por defecto, se sobrescribirá en apps web (jsdom)
        setupFiles: ['setupTest.ts'], // Archivos de setup globales (ej: para mocks o matchers globales)
        coverage: {
            provider: 'v8', // O 'istanbul'
            reporter: ['text', 'json', 'html'], // Reportes de cobertura
            include: ['**/src/**/*.{ts,tsx}'], // Incluye archivos en src para cobertura
            exclude: ['**/dist/**', '**/node_modules/**', '**/test/**'], // Excluye directorios
        },
        // Puedes añadir otras configuraciones globales aquí
        // Por ejemplo, aliases de módulos si usas paths absolutos en tu tsconfig
        // resolve: {
        //   alias: {
        //     '@/': new URL('./src/', import.meta.url).pathname, // Ejemplo de alias si tienes src/@/
        //   },
        // },
    },
});
