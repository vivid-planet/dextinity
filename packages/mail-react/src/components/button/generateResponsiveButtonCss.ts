import { generateResponsiveVariantCss, type ResponsiveVariantProperties } from "../../styles/responsiveCss.js";
import type { ButtonVariantStyles, Theme } from "../../theme/themeTypes.js";

const buttonProperties: ResponsiveVariantProperties<ButtonVariantStyles> = [
    "color",
    "backgroundColor",
    "backgroundImage",
    "border",
    "borderRadius",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "padding",
];

interface GenerateResponsiveButtonCssOptions {
    /** Selector for variant style overrides, given a variant name. */
    styleSelector: (variantName: string) => string;
}

/** Generates responsive CSS media queries for button variant overrides. */
export function generateResponsiveButtonCss(theme: Theme, options: GenerateResponsiveButtonCssOptions): string {
    return generateResponsiveVariantCss<ButtonVariantStyles>({
        breakpoints: theme.breakpoints,
        variants: theme.button.variants,
        groups: [{ selector: options.styleSelector, properties: buttonProperties }],
    });
}
