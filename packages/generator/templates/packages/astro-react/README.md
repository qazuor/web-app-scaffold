## Astro React Integration

This project uses [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) to use React components in Astro.

Example usage:

```astro
---
// src/pages/index.astro
import MyReactComponent from "../components/MyReactComponent";
---
<MyReactComponent client:load />
```
