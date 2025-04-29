import path from 'node:path';
import fs from 'fs-extra';

const validateName = async (isPackage: boolean, name: string): Promise<string | true> => {
    if (!name) {
        return `${isPackage ? 'Shared package' : 'App'} name is required`;
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
        return `${isPackage ? 'Shared package' : 'App'} name must contain only lowercase letters, numbers, and hyphens`;
    }

    if (name.length < 2) {
        return `${isPackage ? 'Shared package' : 'App'} name must be at least 2 characters long`;
    }

    if (name.length > 214) {
        return `${isPackage ? 'Shared package' : 'App'} name must be less than 214 characters`;
    }

    // Check if directory already exists
    const dir = path.join(process.cwd(), isPackage ? 'packages' : 'apps', name);
    if (await fs.pathExists(dir)) {
        return `An ${isPackage ? 'Shared package' : 'App'} named "${name}" already exists`;
    }

    return true;
};

const validateUrl = async (url: string, isMandatory: boolean): Promise<string | true> => {
    if (!url) {
        return isMandatory ? 'URL is required' : true;
    }

    try {
        new URL(url); // Usamos constructor nativo para validar
    } catch {
        return 'Invalid URL format';
    }

    return true;
};

export const validate = {
    appName: async (input: string): Promise<string | true> => await validateName(false, input),
    packageName: async (input: string): Promise<string | true> => await validateName(true, input),
    url: async (input: string, isMandatory = true): Promise<string | true> =>
        await validateUrl(input, isMandatory)
};
