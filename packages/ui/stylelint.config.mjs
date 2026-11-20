/**
 * Matches a value with a numeric literal and no `var()` or Sass variable, apart from the given exceptions.
 * Values are tokens (`--dextinity-*`), so literals belong in the tokens files, not in the module stylesheets.
 */
function literalExcept(...allowed) {
    return new RegExp(`^(?!.*(?:var\\(|\\$))(?!(?:${["0", "100%", ...allowed].join("|")})$).*\\d`);
}

/** @type {import('stylelint').Config} */
export default {
    customSyntax: "postcss-scss",
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    ignoreFiles: ["**/__stories__/**", "src/storybook/**", "src/docs/**", "lib/**"],
    rules: {
        "declaration-property-value-disallowed-list": [
            {
                // -1 and 1 order elements within a component's own stacking context, the layer tokens order the overlays
                "z-index": [literalExcept("-1", "1")],
                "font-weight": [literalExcept(), /^(?:normal|bold|bolder|lighter)$/],
                "font-size": [literalExcept(), /^(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|smaller|larger)$/],
                // 1 restores full opacity, like 0 hides
                opacity: [literalExcept("1")],
                // 50% makes a circle, which is a shape, not a corner size
                "/^border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius$/": [literalExcept("50%")],
            },
            {
                message: (property, value) => `Use a --dextinity-* token instead of the literal "${value}" for "${property}"`,
            },
        ],
        "color-no-hex": true,
        "color-named": "never",
        "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"],
    },
};
