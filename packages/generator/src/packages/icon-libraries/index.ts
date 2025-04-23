import type { IconLibraryConfig } from '../types.js';

export const iconLibraries: IconLibraryConfig[] = [
    {
        name: 'iconoir-react',
        displayName: 'Iconoir',
        description: 'The biggest open source icon library',
        version: '^7.3.0',
        importExample: "import { Home } from 'iconoir-react';",
        readmeSection: `
## Iconoir Icons

This project uses [Iconoir](https://iconoir.com) for icons. Iconoir provides a comprehensive set of open source icons.

Example usage:

\`\`\`tsx
import { Home, Search, Settings } from 'iconoir-react';

function MyComponent() {
    return (
        <div>
            <Home />
            <Search />
            <Settings />
        </div>
    );
}
\`\`\`
`,
    },
    {
        name: 'lucide-react',
        displayName: 'Lucide',
        description: 'Beautiful & consistent icons',
        version: '^0.303.0',
        importExample: "import { Home } from 'lucide-react';",
        readmeSection: `
## Lucide Icons

This project uses [Lucide](https://lucide.dev) for icons. Lucide is a community-driven fork of Feather Icons.

Example usage:

\`\`\`tsx
import { Home, Search, Settings } from 'lucide-react';

function MyComponent() {
    return (
        <div>
            <Home />
            <Search />
            <Settings />
        </div>
    );
}
\`\`\`
`,
    },
    {
        name: 'react-icons',
        displayName: 'React Icons',
        description: 'Popular icons in one package',
        version: '^4.12.0',
        importExample: "import { FaHome } from 'react-icons/fa';",
        readmeSection: `
## React Icons

This project uses [React Icons](https://react-icons.github.io/react-icons) which includes icons from multiple icon libraries.

Example usage:

\`\`\`tsx
import { FaHome } from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoSettingsSharp } from 'react-icons/io5';

function MyComponent() {
    return (
        <div>
            <FaHome />
            <AiOutlineSearch />
            <IoSettingsSharp />
        </div>
    );
}
\`\`\`
`,
    },
    {
        name: '@iconscout/react-unicons',
        displayName: 'Unicons',
        description: 'Pixel-perfect vector icons',
        version: '^2.0.2',
        importExample: "import { UilHome } from '@iconscout/react-unicons';",
        readmeSection: `
## Unicons

This project uses [Unicons](https://iconscout.com/unicons) for icons. Unicons provides a consistent set of pixel-perfect vector icons.

Example usage:

\`\`\`tsx
import { UilHome, UilSearch, UilSetting } from '@iconscout/react-unicons';

function MyComponent() {
    return (
        <div>
            <UilHome />
            <UilSearch />
            <UilSetting />
        </div>
    );
}
\`\`\`
`,
    },
    {
        name: 'react-feather',
        displayName: 'Feather',
        description: 'Simply beautiful icons',
        version: '^2.0.10',
        importExample: "import { Home } from 'react-feather';",
        readmeSection: `
## Feather Icons

This project uses [Feather Icons](https://feathericons.com) for icons. Feather Icons provides a clean and consistent icon set.

Example usage:

\`\`\`tsx
import { Home, Search, Settings } from 'react-feather';

function MyComponent() {
    return (
        <div>
            <Home />
            <Search />
            <Settings />
        </div>
    );
}
\`\`\`
`,
    },
];
