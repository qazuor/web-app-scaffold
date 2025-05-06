// apps/web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
const sharedConfig = require('@repo/config/tailwind.config');

module.exports = {
    // Extiende la configuración base compartida
    presets: [sharedConfig],

    // Define el contenido específico para esta app (ARCHIVOS DONDE USAS CLASES DE TAILWIND)
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    theme: {
        extend: {
            // Ejemplo: Puedes sobrescribir un color definido en la base o añadir uno nuevo
            colors: {
                'brand-primary': '#FF0000', // Sobrescribe el color primario solo para esta app
                'web-specific-color': '#abcdef' // Añade un color solo para esta app
            },
            // Ejemplo: Añadir una configuración de espaciado adicional
            spacing: {
                128: '32rem'
            }
        }
    },

    // Puedes añadir plugins específicos para esta app
    plugins: []
};
