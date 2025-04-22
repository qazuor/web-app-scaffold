import baseConfig from '@repo/config/tailwind.config';

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
};
