import baseConfig from '@repo/config/tailwind.config';

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
