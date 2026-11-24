# Frontend Tooling [![Version](https://img.shields.io/github/v/tag/marclang64/frontend-tooling?sort=semver&label=version)](https://github.com/marclang64/frontend-tooling/releases)

Reusable frontend quality tools and project initializer for JavaScript, TypeScript, React, CSS and SCSS.

## Requirements

Node.js 24.15+ (recommended), or another version matching `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

After publishing the v1.0.0 tag, install in an existing project containing `package.json`:

```bash
npm install -D github:marclang64/frontend-tooling#v1.0.0
npx frontend-tooling init
```

ESLint, Prettier, TypeScript, Stylelint and their configuration dependencies are installed automatically. React and React type declarations remain application dependencies.

## Initialization

The CLI asks for a language (JavaScript or TypeScript), framework (Vanilla or React), and styles (none, CSS or SCSS). For unattended setup:

```bash
npx frontend-tooling init --typescript --react --scss --yes
```

Without a terminal or with `--yes`, unspecified options default to JavaScript, Vanilla and no styles. Conflicting flags are rejected. The initializer does not scaffold application source files or install a framework.

It creates ESLint and Prettier configs, optional TypeScript and Stylelint configs, EditorConfig, and adds missing ignore rules, Git attributes and npm scripts. Existing recognized configuration files and scripts are preserved. Repeated initialization with the same options does not duplicate entries. Switching profiles does not replace existing configs; adjust them manually. Existing Git rules are checked by exact line, not semantic equivalence; review conflicting attributes or ignore exceptions. Legacy ESLint configs are preserved but may require migration to flat config.

## Scripts

| Script                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `npm run lint`          | ESLint                                 |
| `npm run lint:fix`      | ESLint autofix                         |
| `npm run format`        | Prettier formatting                    |
| `npm run format:check`  | Check formatting                       |
| `npm run typecheck`     | TypeScript (TypeScript profile only)   |
| `npm run stylelint`     | CSS/SCSS linting (styles profile only) |
| `npm run stylelint:fix` | CSS/SCSS autofix (styles profile only) |

Type checking requires actual TypeScript source files. React projects must supply their own React dependencies. Generated ESLint globals target browser applications and Node configuration/scripts; customize for other environments.

## Manual configuration

The original exports remain available:

```js
import { base, typescript, react } from '@marclang64/frontend-tooling/eslint';
import { browser, prettier } from '@marclang64/frontend-tooling/eslint/environment';

export default [
    ...base,
    ...typescript,
    ...react,
    { languageOptions: { globals: browser } },
    prettier,
];
```

Prettier: `export { default } from '@marclang64/frontend-tooling/prettier';`

TypeScript: extend `@marclang64/frontend-tooling/typescript` in `tsconfig.json`.

Stylelint: export the default from `@marclang64/frontend-tooling/stylelint` for SCSS or `@marclang64/frontend-tooling/stylelint/css` for CSS.

## Development

```bash
npm install
npm run format
npm run lint
npm run format:check
npm run typecheck
npm run stylelint
npm run test:integration
npm pack --dry-run
```

Integration tests pack the distribution, install it in an independent temporary project without manually installing quality tools, verify lint/format/type checks, and exercise the installed CLI. Initializer tests cover configuration selection, preservation and idempotence.

## License

MIT.
