import type { UILibraryConfig } from '../types.js';

export const uiLibraries: UILibraryConfig[] = [
    {
        name: '@shadcn/ui',
        displayName: 'shadcn/ui',
        description: 'Re-usable components built using Radix UI and Tailwind CSS',
        version: 'latest',
        isDev: true,
        dependencies: [
            '@radix-ui/react-icons@^1.3.0',
            'class-variance-authority@^0.7.0',
            'clsx@^2.1.0',
            'tailwind-merge@^2.2.0',
        ],
        devDependencies: [
            '@types/node@^20.10.0',
            'autoprefixer@^10.4.16',
            'postcss@^8.4.32',
            'tailwindcss@^3.4.0',
            'tailwindcss-animate@^1.0.7',
        ],
        setup: ['pnpm dlx shadcn-ui@latest init --yes'],
        configFiles: [
            {
                path: 'components.json',
                content: `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`,
            },
        ],
        readmeSection: `
## shadcn/ui Components

This project uses [shadcn/ui](https://ui.shadcn.com) for its UI components. These are built on top of Radix UI and styled with Tailwind CSS.

To add a new component:

\`\`\`bash
pnpm dlx shadcn-ui@latest add button
\`\`\`

Components are added to the \`src/components/ui\` directory and can be imported and customized as needed.
`,
    },
    {
        name: '@chakra-ui/react',
        displayName: 'Chakra UI',
        description: 'Simple, modular and accessible UI components',
        version: '^2.8.2',
        dependencies: [
            '@chakra-ui/react@^2.8.2',
            '@emotion/react@^11.11.3',
            '@emotion/styled@^11.11.0',
            'framer-motion@^10.17.9',
        ],
        configFiles: [
            {
                path: 'src/theme/index.ts',
                content: `import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: true,
    },
});

export default theme;`,
            },
            {
                path: 'src/providers/ChakraProvider.tsx',
                content: `import { ChakraProvider as Provider } from '@chakra-ui/react';
import theme from '../theme';

export function ChakraProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider theme={theme}>
            {children}
        </Provider>
    );
}`,
            },
        ],
        readmeSection: `
## Chakra UI Components

This project uses [Chakra UI](https://chakra-ui.com) for its component library. Chakra UI provides a set of accessible, reusable, and customizable components.

Example usage:

\`\`\`tsx
import { Button, Box, Text } from '@chakra-ui/react';

function MyComponent() {
    return (
        <Box p={4}>
            <Text fontSize="xl">Hello World</Text>
            <Button colorScheme="blue">Click me</Button>
        </Box>
    );
}
\`\`\`
`,
    },
    {
        name: '@mui/material',
        displayName: 'Material UI',
        description: "Google's Material Design implementation for React",
        version: '^5.15.2',
        dependencies: [
            '@mui/material@^5.15.2',
            '@emotion/react@^11.11.3',
            '@emotion/styled@^11.11.0',
            '@mui/icons-material@^5.15.2',
        ],
        configFiles: [
            {
                path: 'src/theme/index.ts',
                content: `import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

export default theme;`,
            },
            {
                path: 'src/providers/ThemeProvider.tsx',
                content: `import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <MUIThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MUIThemeProvider>
    );
}`,
            },
        ],
        readmeSection: `
## Material UI Components

This project uses [Material UI](https://mui.com) for its component library. MUI provides a comprehensive suite of UI tools and components implementing Google's Material Design.

Example usage:

\`\`\`tsx
import { Button, Box, Typography } from '@mui/material';

function MyComponent() {
    return (
        <Box p={2}>
            <Typography variant="h4">Hello World</Typography>
            <Button variant="contained" color="primary">
                Click me
            </Button>
        </Box>
    );
}
\`\`\`
`,
    },
];
