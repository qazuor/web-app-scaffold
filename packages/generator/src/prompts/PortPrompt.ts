// import { isPortInUse } from '../utils/port-manager.js';
// import { BasePrompt } from './BasePrompt.js';

// /**
//  * Handles port number prompts
//  */
// export class PortPrompt extends BasePrompt<string> {
//     constructor() {
//         super({
//             type: 'input',
//             name: 'port',
//             message: 'Port number for the application:',
//             default: 3000
//         });
//     }

//     public async setNextAvailablePort(nextAvailablePort: number) {
//         this.question.default = nextAvailablePort;
//     }

//     /**
//      * Validates port number
//      */
//     public async validate(port: string): Promise<true | string> {
//         const portNum = Number(port);

//         if (Number.isNaN(portNum)) {
//             return 'Port must be a number';
//         }

//         if (portNum < 1024 || portNum > 65535) {
//             return 'Port must be between 1024 and 65535';
//         }

//         if (await isPortInUse(portNum)) {
//             return `Port ${portNum} is already in use`;
//         }

//         return true;
//     }
// }
