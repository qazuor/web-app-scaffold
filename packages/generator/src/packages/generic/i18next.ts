import type { PackageConfig } from '../types.js';

export const i18nextPackage: PackageConfig = {
    name: 'i18next',
    displayName: 'i18next',
    description: 'Internationalization framework',
    version: '^23.7.16',
    canBeShared: true,
    sharedPackageTemplate: 'i18next',
    defaultSharedName: 'i18n',
    dependencies: ['react-i18next@^14.0.0'],
    configFiles: [
        {
            path: 'src/i18n/index.ts',
            content: (appName) => `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
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
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
`,
        },
        {
            path: 'src/i18n/locales/en.json',
            content: `{
  "app": {
    "title": "{{appName}}",
    "welcome": "Welcome to {{appName}}",
    "description": "A modern web application"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit"
  }
}`,
        },
        {
            path: 'src/i18n/locales/es.json',
            content: `{
  "app": {
    "title": "{{appName}}",
    "welcome": "Bienvenido a {{appName}}",
    "description": "Una aplicación web moderna"
  },
  "nav": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "save": "Guardar",
    "cancel": "Cancelar",
    "submit": "Enviar"
  }
}`,
        },
    ],
    readmeSection: `
## Internationalization (i18n)

This project uses [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/) for internationalization.

Translation files are located in \`src/i18n/locales/\`.

Example usage:

\`\`\`typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.welcome')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
\`\`\`

To change the language:

\`\`\`typescript
import i18n from 'src/i18n';

// Change language
i18n.changeLanguage('es');
\`\`\`
`,
};
