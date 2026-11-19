# Frontend Tooling

Reusable configurations for consistent formatting, linting, type safety and automated code quality in modern frontend projects.

## Overview

Frontend Tooling provides a collection of reusable configurations and development tools for JavaScript, TypeScript, React, CSS and SCSS projects.

The goal is to establish consistent coding standards, improve code quality and simplify the setup of new projects.

## Tooling

| Tool | Purpose | Status |
|---|---|---|
| EditorConfig | Consistent editor settings | Available |
| Prettier | Automated code formatting | Available |
| ESLint | JavaScript and TypeScript linting | Planned |
| Stylelint | CSS and SCSS linting | Planned |
| TypeScript | Strict type checking | Planned |
| GitHub Actions | Automated quality checks | Planned |

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/marclang64/frontend-tooling.git
cd frontend-tooling
npm install
```

### Code Formatting

Prettier is configured to provide consistent formatting across supported file types.

Format all files:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

### Configuration

The Prettier configuration is located at:

`configs/prettier.config.mjs`

Current conventions include:

- 4 spaces for indentation
- Single quotes in JavaScript and TypeScript
- Semicolons
- Trailing commas where supported
- 100-character preferred line width
- LF line endings

General editor conventions are defined in `.editorconfig`.

## Project Structure

```text
frontend-tooling/
├── configs/
│   └── prettier.config.mjs
├── examples/
│   └── vanilla-ts/
│       └── example.ts
├── .editorconfig
├── .gitignore
├── .prettierignore
├── package.json
├── package-lock.json
└── README.md
```

## Roadmap

- [x] EditorConfig
- [x] Prettier configuration
- [ ] ESLint configuration
- [ ] Stylelint configuration
- [ ] TypeScript configuration
- [ ] Automated quality checks with GitHub Actions
- [ ] Reusable configuration exports
- [ ] Example projects

## License

MIT
