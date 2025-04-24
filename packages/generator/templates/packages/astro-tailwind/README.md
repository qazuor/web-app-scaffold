## Astro Tailwind Integration

This project uses [@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) for Tailwind CSS support.

Example usage:

```astro
---
// src/pages/index.astro
---
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 class="text-2xl font-bold text-gray-800">Hello World</h1>
  <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```
