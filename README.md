# Frontend Tooling

Reusable configurations for consistent formatting, linting, type safety, and automated code quality in modern frontend projects.

## Overview

Frontend Tooling provides a collection of reusable, opinionated configurations for JavaScript, TypeScript, React, CSS, and SCSS projects.

The goal is to establish consistent coding standards, improve code quality, and reduce repetitive setup across projects.

The configurations can be used independently or combined depending on the project's requirements.

## Features

| Tool              | Purpose                                     |
| ----------------- | ------------------------------------------- |
| EditorConfig      | Consistent editor settings                  |
| Prettier          | Automated code formatting                   |
| ESLint            | JavaScript, TypeScript, and React linting   |
| Stylelint         | CSS and SCSS linting                        |
| TypeScript        | Strict type checking                        |
| GitHub Actions    | Automated quality checks                    |
| Integration Tests | Validation of the packaged npm distribution |

## Installation

The package is designed to be installed as a development dependency.

Once published to npm:

```bash
npm install --save-dev @marclang64/frontend-tooling
```

Install the tools required by your project:

```bash
npm install --save-dev eslint@^9 prettier@^3 typescript@^6 stylelint@^18
```

Only install the tools you intend to use. The package provides their configurations, not a replacement for the tools themselves.

Until the package is published, it can be installed from a local package archive.

## Configuration

### ESLint

Provides modular configurations for JavaScript, TypeScript, and React.

Create `eslint.config.mjs`:

```javascript
import { base, typescript, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...typescript, ...react];
```

For projects without React:

```javascript
import { base, typescript } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...typescript];
```

Run ESLint:

```bash
npx eslint .
```

The configuration includes recommended rules and additional conventions for code quality.

### Prettier

Create `prettier.config.mjs`:

```javascript
export { default } from '@marclang64/frontend-tooling/prettier';
```

Format your project:

```bash
npx prettier --write .
```

Check formatting:

```bash
npx prettier --check .
```

The configuration includes:

- 4-space indentation
- Single quotes
- Semicolons
- Trailing commas where supported
- 100-character preferred line width
- LF line endings

### TypeScript

Create `tsconfig.json`:

```json
{
    "extends": "@marclang64/frontend-tooling/typescript",
    "compilerOptions": {
        "lib": ["ES2022", "DOM"]
    },
    "include": ["src"]
}
```

The base configuration enables strict type checking and additional compiler checks.

Project-specific options, such as JSX support, can be added as needed.

Run the TypeScript compiler:

```bash
npx tsc --noEmit
```

### Stylelint

Create `stylelint.config.mjs`:

```javascript
export { default } from '@marclang64/frontend-tooling/stylelint';
```

Run Stylelint:

```bash
npx stylelint "src/**/*.{css,scss}"
```

The configuration extends standard SCSS rules and includes additional conventions, such as disallowing named colors and `!important` declarations.

## Development

To contribute to or modify the configurations, clone the repository:

```bash
git clone https://github.com/marclang64/frontend-tooling.git
cd frontend-tooling
npm ci
```

### Available Scripts

| Command                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `npm run lint`             | Run ESLint                                   |
| `npm run lint:fix`         | Automatically fix supported ESLint issues    |
| `npm run format`           | Format files with Prettier                   |
| `npm run format:check`     | Check formatting without modifying files     |
| `npm run typecheck`        | Run TypeScript checks                        |
| `npm run stylelint`        | Run Stylelint                                |
| `npm run stylelint:fix`    | Automatically fix supported Stylelint issues |
| `npm run test:integration` | Test the packaged npm distribution           |

### Integration Tests

Integration tests validate the package in an isolated consumer project.

The test suite:

1. Creates an npm package archive using `npm pack`.
2. Installs the archive into a temporary project.
3. Imports each exported configuration.
4. Verifies expected ESLint, Prettier, TypeScript, and Stylelint behavior.
5. Removes the temporary project.

Run the tests:

```bash
npm run test:integration
```

### Continuous Integration

GitHub Actions automatically runs code quality checks, integration tests, and package validation on pushes and pull requests.

This helps ensure that changes do not break existing configurations or the packaged distribution.

## Project Structure

```text
frontend-tooling/
├── .github/
│   └── workflows/
│       └── ci.yml
├── configs/
│   ├── eslint/
│   │   ├── base.mjs
│   │   ├── index.mjs
│   │   ├── react.mjs
│   │   └── typescript.mjs
│   ├── typescript/
│   │   └── tsconfig.base.json
│   ├── prettier.config.mjs
│   └── stylelint.config.mjs
├── examples/
│   ├── react/
│   ├── scss/
│   └── vanilla-ts/
├── tests/
│   └── integration/
│       └── package.test.mjs
├── eslint.config.mjs
├── package.json
└── README.md
```

## Roadmap

- [x] EditorConfig
- [x] Prettier configuration
- [x] Modular ESLint configuration
- [x] Stylelint configuration
- [x] TypeScript base configuration
- [x] Reusable package exports
- [x] Example projects
- [x] Automated quality checks with GitHub Actions
- [x] Package integration tests
- [ ] Publish package to npm

## License

MIT
