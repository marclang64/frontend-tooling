import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        rules: {
            'no-debugger': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
        },
    },
];
