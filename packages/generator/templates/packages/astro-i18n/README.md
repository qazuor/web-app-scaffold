## Astro i18n Integration

This project uses [@astrojs/i18n](https://docs.astro.build/en/guides/integrations-guide/i18n/) for internationalization.

Translation files are located in `src/i18n/`.

Example usage:

```astro
---
// src/pages/index.astro
import { useTranslations } from "@astrojs/i18n";
const t = useTranslations("en");
---
<h1>{t("app.welcome")}</h1>
<p>{t("app.description")}</p>
```
