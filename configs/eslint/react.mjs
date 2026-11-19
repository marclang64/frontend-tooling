import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const files = ['**/*.{jsx,tsx}'];

export default [
    {
        ...react.configs.flat.recommended,
        files,
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ...react.configs.flat['jsx-runtime'],
        files,
    },
    {
        ...reactHooks.configs.flat.recommended,
        files,
    },
    {
        files: ['**/*.tsx'],
        rules: {
            'react/prop-types': 'off',
        },
    },
];
