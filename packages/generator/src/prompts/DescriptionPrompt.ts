// import { getDefaultDescriptionForFramework } from '../../utils/core/defaults.js';
// import { BasePrompt } from './BasePrompt.js';

// /**
//  * Handles application description prompts
//  */
// export class DescriptionPrompt extends BasePrompt<string> {
//     constructor(framework: string, appName: string) {
//         super({
//             type: 'input',
//             name: 'description',
//             message: 'Application description:',
//             default: getDefaultDescriptionForFramework(framework, appName)
//         });
//     }

//     /**
//      * Validates description
//      */
//     public async validate(_description: string): Promise<true> {
//         return true;
//     }
// }
