// import path from 'node:path';
// import fs from 'fs-extra';

// /**
//  * Gets package defaults from root package.json
//  */
// export async function getPackageMetadataDefaults(): Promise<Record<string, string | undefined>> {
//     try {
//         const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
//         if (await fs.pathExists(rootPackageJsonPath)) {
//             const packageJson = await fs.readJson(rootPackageJsonPath);
//             return {
//                 author: packageJson.author,
//                 license: packageJson.license,
//                 repository: packageJson.repository.url,
//                 bugs: packageJson.bugs.url,
//                 homepage: packageJson.homepage
//             };
//         }
//     } catch (error) {
//         console.error('Error reading root package.json:', error);
//     }
//     return {};
// }
