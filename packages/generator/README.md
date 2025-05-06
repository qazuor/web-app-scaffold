# Web App Generator

A powerful generator for creating applications in a Turborepo monorepo. This guide explains how to use the generator and create new framework templates.

## Using the Generator

The generator is used via the `create:app` command:

```bash
pnpm create:app
```

This will guide you through creating a new application with:

1. Framework selection
2. Application name and description
3. Port number
4. Package metadata (author, license, etc.)
5. UI Library selection (if framework supports UI)
6. Icon Library selection (if framework supports UI)
7. Additional packages selection

## Adding a New Framework Template

To add a new framework template, create a new directory in `packages/generator/templates/frameworks/your-framework` with the following structure:

```
your-framework/
├── config.json              # Framework configuration
├── package.json.hbs         # Package.json template
├── README.md.hbs            # README template
├── .env.example.hbs         # Environment variables template
├── anothers config files    # Framework configuration files
└── files/                   # Framework files
    ├── src/                 # Source code
    ├── tests/               # Test files
    └── config files         # Framework configuration files
```

### 1. Framework Configuration (config.json)

The `config.json` file defines your framework's configuration:

```json
{
    "$schema": "../../framework.schema.json",
    "name": "your-framework",
    "displayName": "Your Framework",
    "description": "Description of your framework",
    "defaultAppName": "your-app",
    "defaultAppDescription": "A new app with Your Framework",
    "dependencies": [
        {
            "name": "framework-package",
            "version": "^1.0.0"
        }
    ],
    "devDependencies": [
        {
            "name": "typescript",
            "version": "^5.0.0"
        }
    ],
    "testingDependencies": [
        {
            "name": "vitest",
            "version": "^1.3.0"
        }
    ],
    "scripts": [
        {
            "name": "dev",
            "command": "your-dev-command"
        }
    ],

    "testingScripts": [
        {
            "name": "test",
            "command": "vitest run"
        }
    ],
    "envVars": [
        {
            "name": "API_URL",
            "value": "http://localhost:3000"
        }
    ],
    "hasUI": true,
    "addBiome": true,
    "addTesting": true
}
```

### 2. Template Files

Use Handlebars templates (`.hbs` extension) for files that need dynamic content:

```handlebars
{
    "name": "{{app.name}}",
    "description": "{{app.description}}",
    "version": "0.0.1",
    "scripts": {
        {{getScripts scripts}}
    },
    "dependencies": {
        {{getDependencies dependencies}}
    }
}
```

Available template variables:

```typescript
interface TemplateContext {
    app: {
        name: string;
        description: string;
        port: number;
        author: string;
        license: string;
        homepage: string;
        repoUrl: string;
        bugsUrl: string;
        bugsEmail: string;
    };
    framework: {
        name: string;
        displayName: string;
        description: string;
        hasUI: boolean;
        addBiome: boolean;
        addTesting: boolean;
    };
    dependencies: {
        configAppDependencies: PackageDependency[];
        dynamicAppDependencies: PackageDependency[];
        // ... more dependency types
    };
    scripts: {
        configAppScripts: PackageScript[];
        dynamicAppScripts: PackageScript[];
        // ... more script types
    };
    envVars: {
        configAppEnvVars: PackageEnvVar[];
        dynamicAppEnvVars: PackageEnvVar[];
        // ... more env var types
    };
}
```

### 3. Framework Files

Place your framework's files in the `files` directory. These can include:

- Source code
- Configuration files
- Test files
- Static assets

Example structure:

```
files/
├── src/
│   ├── index.ts
│   └── components/
├── tests/
│   └── index.test.ts
├── tsconfig.json
└── vite.config.ts
```

### 4. Dynamic Configuration

For more complex configuration needs, you can add script files in a `scripts` directory:

```
scripts/
├── dependencies.ts     # Dynamic dependencies
├── env-vars.ts        # Dynamic env vars
├── scripts.ts         # Dynamic scripts
└── template-context-vars.ts  # Additional template vars
```

Example `dependencies.ts`:

```typescript
export const getDependencies = (
    configsManager: ConfigsManager,
    frameworksManager: FrameworksManager,
    packagesManager: PackagesManager
): PackageDependency[] => {
    return [
        {
            name: 'your-package',
            version: '^1.0.0'
        }
    ];
};
```

## Best Practices

1. **Framework Configuration**
   - Keep dependencies up to date
   - Use semantic versioning
   - Include all necessary scripts
   - Document environment variables

2. **Templates**
   - Use Handlebars for dynamic content
   - Keep templates DRY
   - Include comprehensive documentation
   - Add proper TypeScript types

3. **Testing**
   - Include test setup and examples
   - Configure testing tools properly
   - Add test scripts

4. **Documentation**
   - Document framework features
   - Include setup instructions
   - Add usage examples
   - List environment variables

## Example Frameworks

See existing framework templates for reference:

- `hono/` - API framework template
- `react-vite/` - React SPA template
- `astro/` - Static site template with React islands

Each template demonstrates proper structure, configuration, and best practices.
