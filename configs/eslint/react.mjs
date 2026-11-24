import { defineConfig } from 'eslint/config';
import react from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

const files = ['**/*.{jsx,tsx}'];

export default defineConfig([
    {
        files,
        extends: [react.configs.recommended],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    {
        files,
        extends: [reactHooks.configs.flat.recommended],
    },
]);
