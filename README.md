# Web App Scaffold 🚀

[![License](https://img.shields.io/github/license/qazuor/web-app-scaffold)](https://github.com/qazuor/web-app-scaffold/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-latest-blueviolet)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-10.9.0-orange)](https://pnpm.io/)

A powerful monorepo generator that helps you create and manage modern web applications with ease. Built with TypeScript, Turborepo, and pnpm.

![Scaffold Demo](https://via.placeholder.com/800x400?text=Scaffold+Demo)

## 🎯 Why Web App Scaffold?

Web App Scaffold stands out with its powerful app generator that lets you:

- 🎨 **Choose Your Stack**: Select from multiple modern frameworks and customize your setup
- 🔌 **Add Integrations**: Easily integrate UI libraries, state management, databases, and more
- 🎭 **Share Code**: Create and manage shared packages across your applications
- ⚡ **Start Fast**: Get a production-ready application with best practices in minutes

## 🎮 Interactive Generator

Our CLI generator guides you through creating new applications with a rich set of options:

```bash
pnpm create:app
```

![Generator Demo](https://via.placeholder.com/600x400?text=Generator+Demo)

### What You Can Configure:

- 🏗️ **Framework Selection**
  - React with Vite (SPA)
  - Astro (Static Sites)
  - TanStack Start (Full-stack)
  - Hono (API Server)

- 📚 **UI Libraries**
  - shadcn/ui
  - Material UI
  - Chakra UI

- 🎨 **Icon Sets**
  - Lucide
  - Iconoir
  - React Icons
  - Feather

- 🔧 **Optional Integrations**
  - Database (Drizzle ORM)
  - State Management (Zustand)
  - Form Handling
  - Validation (Zod)
  - Internationalization
  - Authentication

- 📝 **Project Metadata**
  - Package Info
  - Repository Links
  - Documentation
  - License

## 🚀 Quick Start

1. **Create a new project**:
   ```bash
   pnpm create turbo@latest
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Generate your first app**:
   ```bash
   pnpm create:app
   ```

4. **Start development**:
   ```bash
   pnpm dev
   ```

## 🎨 Generated Apps

Each generated app comes with:

- ✅ Full TypeScript support
- ✅ Modern tooling (Biome, Vitest)
- ✅ Best practices configuration
- ✅ Documentation and examples
- ✅ Testing setup
- ✅ CI/CD ready

### Framework-Specific Features

#### React with Vite
- Hot Module Replacement
- Component-driven development
- Rich ecosystem integration

#### Astro
- Static site generation
- Partial hydration
- Multi-framework support

#### TanStack Start
- Server-side rendering
- Streaming responses
- Type-safe routing
- API routes

#### Hono API
- High performance
- Type-safe endpoints
- Middleware support
- OpenAPI integration

## 🔌 Integration Examples

### Database with Drizzle
```typescript
// Generated type-safe database code
const users = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.id, userId));
```

### UI with shadcn/ui
```typescript
// Generated component setup
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
</Card>
```

### State with Zustand
```typescript
// Generated store setup
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({
    count: state.count + 1
  }))
}));
```

## 🛠️ Advanced Usage

### Custom Templates

Add your own templates to `packages/generator/templates`:

```bash
templates/
├── frameworks/
│   └── your-framework/
└── packages/
    └── your-package/
```

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm build` | Build all apps and packages |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint all files |
| `pnpm format` | Format code |

## 📁 Generated Project Structure

```
.
├── apps/                   # Application projects
│   ├── web/               # Web application
│   └── api/               # API server
├── packages/              # Shared packages
│   ├── ui/                # UI components
│   ├── config/           # Shared configs
│   └── logger/           # Logging utility
└── package.json          # Root package.json
```

The rest of the README remains unchanged...

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build)
- [pnpm](https://pnpm.io)
- [Vite](https://vitejs.dev)
- [Biome](https://biomejs.dev)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/qazuor">Qazuor</a>
</p>
