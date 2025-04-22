'use client';

import type { PackageConfig } from '../types.js';

export const i18nPackage: PackageConfig = {
    name: '@astrojs/i18n',
    displayName: 'Astro i18n Integration',
    description: 'Internationalization for Astro',
    version: '^2.3.0',
    configFiles: [
        {
            path: 'astro.config.mjs',
            content: '',
            append: true,
        },
        {
            path: 'src/i18n/en.json',
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
            path: 'src/i18n/es.json',
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
## Astro i18n Integration

This project uses [@astrojs/i18n](https://docs.astro.build/en/guides/integrations-guide/i18n/) for internationalization.

Translation files are located in \`src/i18n/\`.

Example usage:

\`\`\`astro
---
// src/pages/index.astro
import { useTranslations } from '@astrojs/i18n';
const t = useTranslations('en');
---
<h1>{t('app.welcome')}</h1>
<p>{t('app.description')}</p>
\`\`\`
`,
};
