import standardScss from 'stylelint-config-standard-scss';

export default {
    ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
    extends: [
        import.meta.resolve('stylelint-config-standard'),
        import.meta.resolve('stylelint-config-recommended-scss'),
    ],
    rules: {
        ...standardScss.rules,
        'color-named': 'never',
        'declaration-no-important': true,
    },
};
