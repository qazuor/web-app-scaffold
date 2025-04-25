# Contributing to Web App Scaffold

First off, thank you for considering contributing to Web App Scaffold! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed functionality
* Explain why this enhancement would be useful
* List any similar features in other projects if applicable
* Include mockups or examples if possible

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows our coding standards
5. Update the documentation if needed

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/qazuor/web-app-scaffold.git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Structure

```
.
├── apps/                   # Application templates
│   ├── web/               # Web application template
│   └── api/               # API server template
├── packages/              # Shared packages
│   ├── generator/         # App generator package
│   ├── ui/                # UI components
│   ├── config/           # Shared configs
│   └── logger/           # Logging utility
└── package.json          # Root package.json
```

## Coding Standards

- Use 4 spaces for indentation
- Use single quotes for strings
- Always terminate statements with semicolons
- Order Tailwind CSS classes alphabetically
- Place interfaces and types in `./src/types`
- Include `<title>` in SVG elements
- Use `<button>` instead of `role='button'`
- Specify `type` attribute for buttons
- Use self-closing tags when appropriate
- Write comments in English
- Provide TSDoc documentation for components and methods
- Use `useTranslation` for text content
- Always use curly braces in 'if' statements
- Avoid using 'any' type

### TypeScript

- Enable strict mode
- Use explicit types over implicit ones
- Avoid using `any`
- Use interfaces for object types
- Use type for unions and intersections

### React

- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Testing

- Write tests for new features
- Maintain test coverage
- Use meaningful test descriptions
- Follow testing best practices

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
feat(generator): add support for custom templates

- Add template loading mechanism
- Implement validation for custom templates
- Update documentation

Closes #123
```

## Adding New Features

1. **App generator Templates**
   - Add new templates in `packages/generator/templates`
   - Follow existing template structure
   - Include necessary configuration files
   - Add tests for the template

2. **Packages**
   - Add new shared packages in `packages/`
   - Follow monorepo structure
   - Include proper documentation
   - Add necessary tests

3. **Configuration**
   - Update shared configs in `packages/config`
   - Maintain backward compatibility
   - Document changes

## Documentation

- Update README.md for major changes
- Add JSDoc comments for new functions
- Update type definitions
- Include usage examples

## Questions?

Feel free to open an issue with the tag `question` if you have any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
