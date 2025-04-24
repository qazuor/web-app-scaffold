## Internationalization with i18next

This project uses [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/) for internationalization.

Translation files are located in `src/i18n/locales/`.

Example usage:

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("app.welcome")}</h1>
      <p>{t("app.description")}</p>
    </div>
  );
}

// Change language
import i18n from "src/i18n";
i18n.changeLanguage("es");
```
