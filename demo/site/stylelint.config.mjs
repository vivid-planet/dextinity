/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard-scss"],
    rules: {
        "declaration-block-no-redundant-longhand-properties": null,
        "declaration-empty-line-before": null,
        "media-feature-range-notation": "prefix",
        "shorthand-property-no-redundant-values": null,
        "selector-class-pattern": null,
        "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }],
        "custom-property-pattern": null,
        "value-keyword-case": null,
        "scss/percent-placeholder-pattern": null,
        "custom-property-empty-line-before": null,
    },
};
