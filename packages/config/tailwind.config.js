/** @type {import('tailwindcss').Config} */
module.exports = {
    // El `content` debe ser definido en cada proyecto individual
    content: [],

    theme: {
        extend: {
            // Ejemplo: Añadir un color base que todas las apps puedan usar
            colors: {
                "brand-primary": "#0070f3",
                "brand-secondary": "#1a202c",
            },
            // Ejemplo: Añadir una fuente personalizada
            fontFamily: {
                sans: ["Inter", "sans-serif"], // Asegúrate de importar la fuente en tu CSS
            },
        },
    },

    plugins: [
        // Ejemplo: Añadir plugins comunes que quieras en todas partes
        // require('@tailwindcss/forms'),
        // require('@tailwindcss/typography'),
    ],

    // Si necesitas prefijos comunes para evitar conflictos
    // prefix: 'my-',
};
