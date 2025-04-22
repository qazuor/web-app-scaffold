import type { PackageConfig } from '../types.js';

export const i18nextPackage: PackageConfig = {
    name: 'i18next',
    displayName: 'i18next',
    description: 'Internationalization framework',
    version: '^23.7.16',
    configFiles: [
        {
            path: 'src/i18n/index.ts',
            content: `import i18next from 'i18next';

// Import translations
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Initialize i18next
i18next.init({
  resources: {
    en: {
      translation: enTranslation,
    },
    es: {
      translation: esTranslation,
    },
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
`,
        },
        {
            path: 'src/i18n/locales/en.json',
            content: `{
  "api": {
    "welcome": "Welcome to {{appName}} API",
    "notFound": "Resource not found",
    "error": "An error occurred"
  },
  "validation": {
    "required": "{{field}} is required",
    "invalid": "{{field}} is invalid"
  }
}`,
        },
        {
            path: 'src/i18n/locales/es.json',
            content: `{  "{{field}} is invalid"
  }
}`,
        },
        {
            path: 'src/i18n/locales/es.json',
            content: `{
  "api": {
    "welcome": "Bienvenido a la API de {{appName}}",
    "notFound": "Recurso no encontrado",
    "error": "Ocurrió un error"
  },
  "validation": {
    "required": "{{field}} es requerido",
    "invalid": "{{field}} es inválido"
  }
}`,
        },
    ],
    readmeSection: `
## Internationalization (i18n)

This project uses [i18next](https://www.i18next.com/) for internationalization.

Translation files are located in \`src/i18n/locales/\`.

Example usage:

\`\`\`typescript
import i18next from 'src/i18n';

// Translate a string
const welcomeMessage = i18next.t('api.welcome', { appName: 'My API' });

// Change language
i18next.changeLanguage('es');
\`\`\`
`,
};
