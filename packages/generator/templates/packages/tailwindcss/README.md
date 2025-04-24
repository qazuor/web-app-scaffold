## TailwindCSS

This project uses [TailwindCSS](https://tailwindcss.com/) for styling.

TailwindCSS is already configured and ready to use. The configuration extends the base configuration from `@repo/config/tailwind.config.js`.

Example usage:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-800">Hello World</h1>
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```
