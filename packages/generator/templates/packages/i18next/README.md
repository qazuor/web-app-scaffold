# @repo/i18n

This package provides a shared i18next configuration and translations for use across the monorepo.

## Features

- Preconfigured i18next setup with React integration
- Type-safe translations
- Multiple language support (English and Spanish)
- Shared translation files

## Installation

This package is automatically installed as a dependency when selecting i18next as a shared package during app generation.

To manually install in an existing app:

```bash
pnpm add @repo/i18n@workspace:*
```

## Usage

```typescript
import i18n, { type TranslationKey } from '@repo/i18n';
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

// Change language
i18n.changeLanguage('es');
```

## Available Scripts

- `pnpm lint` - Run linter
- `pnpm format` - Format code

## Translation Structure

Translations are organized in the following structure:

### App Section
- `app.title` - Application title
- `app.welcome` - Welcome message
- `app.description` - Application description

### Navigation
- `nav.home` - Home link text
- `nav.about` - About link text
- `nav.contact` - Contact link text

### Common Elements
- `common.loading` - Loading state text
- `common.error` - Error message
- `common.save` - Save button text
- `common.cancel` - Cancel button text
- `common.submit` - Submit button text

## Adding New Translations

1. Add your translation key and text to `src/locales/en.json`
2. Add the corresponding translation to `src/locales/es.json`
3. Update the `TranslationKey` type in `src/index.ts` if needed

## Contributing

When making changes to this package:

1. Keep translations consistent across languages
2. Use proper pluralization when needed
3. Document any new translation keys
4. Update types if applicable

## License

Internal package - All rights reserved
