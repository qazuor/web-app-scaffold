## Astro View Transitions

This project uses [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/) for smooth page transitions.

Example usage:

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from "astro:transitions";
---
<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```
