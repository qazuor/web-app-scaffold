import Handlebars from 'handlebars';

export class PackageTemplateManager {
    constructor() {
        this.addHelpers();
    }

    // Register Handlebars helpers
    addHelpers(): void {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('includes', (array, value) => {
            if (!Array.isArray(array)) {
                return false;
            }
            return array.includes(value);
        });
    }
}
