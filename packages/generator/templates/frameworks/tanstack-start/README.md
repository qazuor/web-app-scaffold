# {{appName}}

{{description}}

## Features

- **Enterprise-Grade Routing**: Type-safe routing with code-splitting and lazy loading
- **SSR & Streaming**: Server-side rendering and streaming for optimal user experience
- **Server Functions & API Routes**: Write server code alongside your client code
- **Deploy Anywhere**: Deploy to traditional servers, serverless platforms, or CDNs

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

- `app/root.tsx`: The root layout component
- `app/routes/`: File-based routing directory
- `app/routes/api.*.ts`: API routes
- `app/server-functions/`: Server functions that can be called from the client
- `app/entry-client.tsx`: Client entry point
- `app/entry-server.tsx`: Server entry point
- `app/global.css`: Global styles

## Available Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run Biome linter
- `pnpm format`: Format code with Biome
- `pnpm check`: Check and apply automatic fixes

## Learn More

To learn more about TanStack Start, check out the [TanStack Start documentation](https://tanstack.com/start/latest).
