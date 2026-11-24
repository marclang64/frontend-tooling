export default {
    ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
    extends: [import.meta.resolve('stylelint-config-standard')],
    rules: {
        'color-named': 'never',
        'declaration-no-important': true,
    },
};
