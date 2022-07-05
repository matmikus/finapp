module.exports = {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-css-modules'
    ],
    customSyntax: 'postcss-html',
    rules: {
        indentation: 4,
        'at-rule-no-unknown': null,
        'no-descending-specificity': null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['export', 'global']
            }
        ],
        'selector-pseudo-element-no-unknown': [
            true,
            {
                ignorePseudoElements: ['v-deep']
            }
        ]
    }
};
