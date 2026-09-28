import { generateResponsiveVariantCss, type ResponsiveVariantProperties } from "../../styles/responsiveCss.js";
import type { DividerVariantStyles, Theme } from "../../theme/themeTypes.js";

const dividerProperties: ResponsiveVariantProperties<DividerVariantStyles> = [
    // line-height matches height so Outlook honors the declared cell height.
    { themeKey: "height", cssProperties: ["height", "line-height"], unit: "px" },
    "backgroundColor",
    "backgroundImage",
];

interface GenerateResponsiveDividerCssOptions {
    /** Selector for divider style overrides, given a variant name. */
    styleSelector: (variantName: string) => string;
}

/** Generates responsive CSS media queries for divider variant overrides. */
export function generateResponsiveDividerCss(theme: Theme, options: GenerateResponsiveDividerCssOptions): string {
    return generateResponsiveVariantCss<DividerVariantStyles>({
        breakpoints: theme.breakpoints,
        variants: theme.divider.variants,
        groups: [{ selector: options.styleSelector, properties: dividerProperties }],
    });
}
