import standardScss from 'stylelint-config-standard-scss';

export default {
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
