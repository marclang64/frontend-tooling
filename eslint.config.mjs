
import { base, typescript, react } from './configs/eslint/index.mjs';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    },
    ...base,
    ...typescript,
    ...react,
    {
        files: ['examples/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    prettier,
];
