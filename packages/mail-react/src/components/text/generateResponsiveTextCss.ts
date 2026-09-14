import { generateResponsiveVariantCss, type ResponsiveVariantProperties } from "../../styles/responsiveCss.js";
import type { TextVariantStyles, Theme } from "../../theme/themeTypes.js";

const textStyleProperties: ResponsiveVariantProperties<TextVariantStyles> = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textDecoration",
    "textTransform",
    "color",
];

const spacingProperties: ResponsiveVariantProperties<TextVariantStyles> = [{ themeKey: "bottomSpacing", cssProperties: "padding-bottom" }];

interface GenerateResponsiveTextCssOptions {
    /** Selector for text style overrides, given a variant name. */
    styleSelector: (variantName: string) => string;
    /** Selector for bottomSpacing overrides, given a variant name. */
    spacingSelector: (variantName: string) => string;
}

/** Generates responsive CSS media queries for text variant overrides. */
export function generateResponsiveTextCss(theme: Theme, options: GenerateResponsiveTextCssOptions): string {
    return generateResponsiveVariantCss<TextVariantStyles>({
        breakpoints: theme.breakpoints,
        variants: theme.text.variants,
        groups: [
            { selector: options.styleSelector, properties: textStyleProperties },
            { selector: options.spacingSelector, properties: spacingProperties },
        ],
    });
}
