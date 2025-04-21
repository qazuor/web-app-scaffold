// plopfile.cjs
const path = require("path");
// Importa helpers de Handlebars, o define tus propios helpers aquí
// const helpers = require('handlebars-helpers')();

// Helper personalizado simple para verificar si una feature está seleccionada
// Uso: {{#if_has_feature answers 'tailwind'}} ... {{/if_has_feature}}
function ifHasFeatureHelper(answers, feature, options) {
    if (answers.features && answers.features.includes(feature)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
}

// Helper para verificar si un UI library está seleccionado
// Uso: {{#if_ui answers 'shadcn'}} ... {{/if_ui}}
function ifUiHelper(answers, uiLib, options) {
    if (answers.uiLibrary === uiLib) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
}

module.exports = (plop) => {
    // Registra los helpers personalizados
    plop.addHelper("if_has_feature", ifHasFeatureHelper);
    plop.addHelper("if_ui", ifUiHelper);
    // Si usaste handlebars-helpers: plop.addHandlebarsHelper(helpers);

    plop.setGenerator("app", {
        description: "Generates a new application",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "What is the name of the application? (kebab-case, e.g. my-new-app)",
                validate: (value) => {
                    if (/.+/.test(value) && /^[a-z0-9-]+$/.test(value)) {
                        return true;
                    }
                    return "App name is required and should be kebab-case (lowercase, numbers, hyphens)";
                },
            },
            {
                type: "list",
                name: "framework",
                message: "Which framework do you want to use?",
                choices: [
                    "tanstack-start",
                    "hono",
                    "vite-react",
                    "next",
                    "remix",
                    "documentation", // Asumimos un site estático o con alguna base de docs
                ],
            },
            // --- Prompts Condicionales para Features/Packages ---
            // La lógica 'when' determina si se muestra el prompt

            {
                type: "checkbox",
                name: "reactFeatures",
                message: "Select React-specific features/packages:",
                choices: [
                    { name: "@qazuor/react-hooks", value: "@qazuor/react-hooks" },
                    { name: "@qazuor/react-form-toolkit", value: "@qazuor/react-form-toolkit" },
                    { name: "React Router (react-router-dom)", value: "react-router" }, // Añadido react-router
                    { name: "TanStack Router", value: "tanstack-router" }, // Añadido tanstack-router
                    { name: "Auth UI (better-auth/auth.js)", value: "auth-ui" }, // Para libs que ofrecen componentes UI
                    {
                        name: "Onboarding/Tours (React Joyride/Intro.js React)",
                        value: "onboarding",
                    },
                    { name: "Animations (Framer Motion)", value: "framer-motion" },
                    { name: "Icons (Lucide/React Icons/Material Icons)", value: "icons" }, // Agrupado iconos
                    { name: "Sonner (Toasts)", value: "sonner" },
                    { name: "Popper.js (Tooltips/Poppers)", value: "popperjs" },
                    { name: "Charts (Chart.js + react-chartjs-2)", value: "charts" }, // Agrupado charts
                ],
                when: (answers) => {
                    // Mostrar solo para frameworks React o con soporte React
                    return ["tanstack-start", "vite-react", "next", "remix"].includes(
                        answers.framework,
                    );
                },
            },
            {
                type: "list",
                name: "uiLibrary",
                message: "Choose a UI library:",
                choices: [
                    { name: "None", value: "none" },
                    { name: "Shadcn UI (via CLI)", value: "shadcn" }, // Shadcn requiere pasos manuales/CLI después
                    { name: "Chakra UI", value: "chakra-ui" },
                    { name: "Material UI (@mui/*)", value: "material-ui" },
                    { name: "Ant Design (antd)", value: "ant-design" },
                    { name: "Semantic UI React", value: "semantic-ui-react" },
                ],
                when: (answers) => {
                    // Mostrar solo para frameworks React o con soporte UI
                    return [
                        "tanstack-start",
                        "vite-react",
                        "next",
                        "remix",
                        "documentation",
                    ].includes(answers.framework);
                },
            },
            {
                type: "confirm",
                name: "includeTailwind",
                message: "Include Tailwind CSS?",
                default: true,
                when: (answers) => {
                    // Generalmente útil para frameworks con UI
                    return [
                        "tanstack-start",
                        "vite-react",
                        "next",
                        "remix",
                        "documentation",
                        "hono",
                    ].includes(answers.framework); // Tailwind también puede ser útil en backend para emails, etc., aunque menos común
                },
            },
            {
                type: "checkbox",
                name: "dataFeatures",
                message: "Select Data/API features/packages:",
                choices: [
                    { name: "Zod (Validation)", value: "zod" },
                    { name: "Axios (HTTP Client)", value: "axios" },
                    { name: "ORM (Drizzle)", value: "drizzle" },
                    { name: "ORM (Prisma)", value: "prisma" },
                    { name: "Authentication (better-auth/auth.js)", value: "auth-backend" }, // Para backend logic auth
                ],
                when: (answers) => {
                    // Mostrar para frameworks con capacidades backend o que necesitan validación/HTTP
                    return ["hono", "next", "remix", "tanstack-start"].includes(answers.framework); // TanStack Start puede tener backend
                },
            },
            {
                type: "confirm",
                name: "includeI18n",
                message: "Include i18next (i18next + react-i18next + plugins)?",
                default: false,
                when: (answers) => {
                    // Útil para cualquier app con UI
                    return [
                        "tanstack-start",
                        "vite-react",
                        "next",
                        "remix",
                        "documentation",
                    ].includes(answers.framework);
                },
            },
            {
                type: "confirm",
                name: "includeDateUtils",
                message: "Include Date Utilities (luxon/date-fns)?",
                default: false,
                // Mostrar siempre, es una utilidad general
            },
            // Puedes añadir más prompts condicionales para configuraciones específicas
            // Por ejemplo, si elige Drizzle, preguntar por la base de datos
        ],
        actions: (answers) => {
            const actions = [];
            const appDir = `apps/${plop.getHelper("kebabCase")(answers.name)}`; // Helper para convertir a kebab-case

            // --- 1. Add base app files (framework independent or base template) ---
            actions.push({
        type: 'add',
        path: `${appDir}/package.json`,
        templateFile: '_templates/app/base/package.json.hbs',
        data: { // Data passed to the template
          name: plop.getHelper('kebabCase')(answers.name),
          framework: answers.framework,
          reactFeatures: answers.reactFeatures,
          uiLibrary: answers.uiLibrary,
          includeTailwind: answers.includeTailwind,
          dataFeatures: answers.dataFeatures,
          includeI18n: answers.includeI18n,
          includeDateUtils: answers: answers.includeDateUtils
           // Pasa todas las respuestas relevantes a los templates para lógica condicional
        },
      });

            actions.push({
                type: "add",
                path: `${appDir}/tsconfig.json`,
                templateFile: "_templates/app/base/tsconfig.json.hbs",
                data: {
                    isReactFramework: ["tanstack-start", "vite-react", "next", "remix"].includes(
                        answers.framework,
                    ),
                    framework: answers.framework, // Pasa framework para cualquier ajuste específico en tsconfig
                },
            });

            // Add base files based on framework (these templates will be different per framework)
            switch (answers.framework) {
                case "vite-react":
                    actions.push(
                        {
                            type: "add",
                            path: `${appDir}/index.html`,
                            templateFile: "_templates/app/vite-react/index.html.hbs",
                        },
                        {
                            type: "add",
                            path: `${appDir}/vite.config.ts`,
                            templateFile: "_templates/app/vite-react/vite.config.ts.hbs",
                        },
                        {
                            type: "add",
                            path: `${appDir}/src/main.tsx`,
                            templateFile: "_templates/app/vite-react/src/main.tsx.hbs",
                            data: {
                                uiLibrary: answers.uiLibrary,
                                includeTailwind: answers.includeTailwind,
                                includeI18n: answers.includeI18n,
                            },
                        },
                        {
                            type: "add",
                            path: `${appDir}/src/App.tsx`,
                            templateFile: "_templates/app/vite-react/src/App.tsx.hbs",
                            data: {
                                reactFeatures: answers.reactFeatures,
                                uiLibrary: answers.uiLibrary,
                                includeTailwind: answers.includeTailwind,
                            },
                        },
                        {
                            type: "add",
                            path: `${appDir}/src/App.css`,
                            templateFile: "_templates/app/vite-react/src/App.css.hbs",
                        }, // CSS base, quizás solo con directivas tailwind si se selecciona
                    );
                    break;
                case "hono":
                    actions.push(
                        {
                            type: "add",
                            path: `${appDir}/src/index.ts`,
                            templateFile: "_templates/app/hono/src/index.ts.hbs",
                            data: { dataFeatures: answers.dataFeatures },
                        },
                        {
                            type: "add",
                            path: `${appDir}/tsconfig.node.json`,
                            templateFile: "_templates/app/hono/tsconfig.node.json.hbs",
                        }, // Hono a menudo usa tsconfig separado para node
                        {
                            type: "add",
                            path: `${appDir}/.env.example`,
                            templateFile: "_templates/app/hono/.env.example.hbs",
                            data: { dataFeatures: answers.dataFeatures },
                        },
                    );
                    break;
                // Add cases for tanstack-start, next, remix, documentation
                // Each case adds the core files specific to that framework
                default:
                    // Fallback for unsupported frameworks, or a basic template
                    console.warn(
                        `Templates for framework "${answers.framework}" not yet implemented. Adding basic structure.`,
                    );
                    actions.push(
                        {
                            type: "add",
                            path: `${appDir}/src/index.ts`,
                            templateFile: "_templates/app/base/src/index.ts.hbs",
                        }, // Un index.ts genérico
                    );
                    break;
            }

            // --- 2. Add Feature-Specific Files/Configs (Conditional) ---

            // Tailwind CSS Configuration
            if (answers.includeTailwind) {
                actions.push(
                    {
                        type: "add",
                        path: `${appDir}/tailwind.config.js`,
                        templateFile: "_templates/app/features/tailwind/tailwind.config.js.hbs",
                    },
                    {
                        type: "add",
                        path: `${appDir}/postcss.config.cjs`,
                        templateFile: "_templates/app/features/tailwind/postcss.config.cjs.hbs",
                    },
                    // Asegúrate que el template CSS principal (ej: src/index.css.hbs) tenga las directivas @tailwind
                    {
                        type: "add",
                        path: `${appDir}/src/index.css`,
                        templateFile: "_templates/app/features/tailwind/src/index.css.hbs",
                    }, // Asegura este archivo existe y tiene @tailwind
                );
            }

            // UI Library Setup (some might need wrapper providers in main.tsx)
            if (answers.uiLibrary !== "none") {
                // Add logic to add provider wrappers in main.tsx template based on uiLibrary
                // This logic is handled in the main.tsx.hbs template itself using helpers
                // Example: {{#if_ui uiLibrary 'chakra-ui'}} <ChakraProvider> {{/if_ui}}
            }

            // Testing Setup (Vitest for React/Node, Jest for others if needed)
            const isReactFramework = ["tanstack-start", "vite-react", "next", "remix"].includes(
                answers.framework,
            );
            const isBackendFramework = ["hono", "next", "remix", "tanstack-start"].includes(
                answers.framework,
            ); // Frameworks donde puedes hacer unit tests no-DOM

            if (isReactFramework || isBackendFramework) {
                // Add testing for most apps
                // Add test setup file that extends the shared config setup
                actions.push({
                    type: "add",
                    path: `${appDir}/test/setupTests.ts`,
                    templateFile: "_templates/app/testing/test/setupTests.ts.hbs",
                    data: {
                        isReactFramework: isReactFramework,
                    },
                });

                // Add a basic test example
                actions.push({
                    type: "add",
                    path: `${appDir}/test/index.test.ts`, // O un nombre más descriptivo
                    templateFile: `_templates/app/testing/test/${isReactFramework ? "react.test.ts.hbs" : "basic.test.ts.hbs"}`, // Template diferente según tipo
                    data: {
                        name: plop.getHelper("pascalCase")(answers.name), // Pasa nombre para usar en tests
                    },
                });
            }

            // --- 3. Run Install ---
            actions.push({
                type: "runAndLog",
                command: "pnpm install", // Instala todas las deps listadas en el package.json generado
            });

            console.log("\n--- Plop Generator Summary ---");
            console.log(`Created app "${answers.name}" (${answers.framework})`);
            console.log(
                "Selected features:",
                answers.reactFeatures,
                answers.dataFeatures,
                answers.uiLibrary,
                answers.includeTailwind,
                answers.includeI18n,
                answers.includeDateUtils,
            );
            console.log("----------------------------\n");

            return actions;
        },
    });

    // --- Puedes añadir otros generadores aquí (ej: 'package', 'component', etc.) ---
    // plop.setGenerator('package', { ... });
};
