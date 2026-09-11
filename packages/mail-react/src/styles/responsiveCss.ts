import { getResponsiveOverrides, type ResponsiveValue } from "../theme/responsiveValue.js";
import type { ThemeBreakpoints } from "../theme/themeTypes.js";
import { css } from "../utils/css.js";

// `string | number` covers every responsive token today; widen it if a token of another value type is added.
type VariantStylesConstraint = Record<string, ResponsiveValue<string | number> | undefined>;

export interface ResponsiveVariantProperty<TVariantStyles> {
    themeKey: keyof TVariantStyles;
    /** CSS property name(s); defaults to the kebab-case form of `themeKey`. */
    cssProperties?: string | readonly string[];
    unit?: string;
}

/** A variant property is either a bare theme key (CSS name derived) or a descriptor for the exceptions. */
export type ResponsiveVariantProperties<TVariantStyles> = ReadonlyArray<keyof TVariantStyles | ResponsiveVariantProperty<TVariantStyles>>;

interface ResponsiveVariantGroup<TVariantStyles> {
    selector: (variantName: string) => string;
    properties: ResponsiveVariantProperties<TVariantStyles>;
}

interface GenerateResponsiveVariantCssOptions<TVariantStyles> {
    breakpoints: ThemeBreakpoints;
    variants: Record<string, TVariantStyles | undefined> | undefined;
    groups: ReadonlyArray<ResponsiveVariantGroup<TVariantStyles>>;
}

const toKebabCase = (value: string): string => value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

/**
 * Generates `max-width` media-query CSS for a themed component's variant overrides.
 * Returns an empty string when no variant has breakpoint overrides.
 */
export function generateResponsiveVariantCss<TVariantStyles extends VariantStylesConstraint>({
    breakpoints,
    variants,
    groups,
}: GenerateResponsiveVariantCssOptions<TVariantStyles>): string {
    if (!variants) {
        return "";
    }

    const cssChunks: string[] = [];

    for (const [variantName, variantStyles] of Object.entries(variants)) {
        if (!variantStyles) {
            continue;
        }

        for (const group of groups) {
            const overridesByBreakpoint = collectOverridesByBreakpoint(variantStyles, group.properties);
            cssChunks.push(renderMediaQueries({ breakpoints, selector: group.selector(variantName), overridesByBreakpoint }));
        }
    }

    return cssChunks.filter(Boolean).join("\n");
}

interface ResponsiveToken {
    value: ResponsiveValue<string | number>;
    cssProperty: string;
    unit?: string;
}

/**
 * Generates `max-width` media-query CSS for theme tokens that are not keyed by variant name.
 * Returns an empty string when no token has breakpoint overrides.
 */
export function generateResponsiveTokenCss({
    breakpoints,
    selector,
    tokens,
}: {
    breakpoints: ThemeBreakpoints;
    selector: string;
    tokens: readonly ResponsiveToken[];
}): string {
    const overridesByBreakpoint = new Map<keyof ThemeBreakpoints, string[]>();

    for (const token of tokens) {
        for (const { breakpointKey, value } of getResponsiveOverrides(token.value)) {
            const declarations = overridesByBreakpoint.get(breakpointKey) ?? [];
            declarations.push(formatDeclaration({ cssProperty: token.cssProperty, value, unit: token.unit }));
            overridesByBreakpoint.set(breakpointKey, declarations);
        }
    }

    return renderMediaQueries({ breakpoints, selector, overridesByBreakpoint });
}

function collectOverridesByBreakpoint<TVariantStyles extends VariantStylesConstraint>(
    variantStyles: TVariantStyles,
    properties: ResponsiveVariantProperties<TVariantStyles>,
): Map<keyof ThemeBreakpoints, string[]> {
    const overridesByBreakpoint = new Map<keyof ThemeBreakpoints, string[]>();

    for (const entry of properties) {
        const property: ResponsiveVariantProperty<TVariantStyles> = typeof entry === "object" ? entry : { themeKey: entry };
        const value = variantStyles[property.themeKey];
        if (value === undefined) {
            continue;
        }

        const cssProperties = resolveCssProperties(property);

        for (const { breakpointKey, value: breakpointValue } of getResponsiveOverrides(value)) {
            const declarations = overridesByBreakpoint.get(breakpointKey) ?? [];
            for (const cssProperty of cssProperties) {
                declarations.push(formatDeclaration({ cssProperty, value: breakpointValue, unit: property.unit }));
            }
            overridesByBreakpoint.set(breakpointKey, declarations);
        }
    }

    return overridesByBreakpoint;
}

function resolveCssProperties<TVariantStyles>(property: ResponsiveVariantProperty<TVariantStyles>): readonly string[] {
    const cssProperties = property.cssProperties ?? toKebabCase(String(property.themeKey));
    return typeof cssProperties === "string" ? [cssProperties] : cssProperties;
}

function formatDeclaration({ cssProperty, value, unit }: { cssProperty: string; value: string | number; unit?: string }): string {
    return `${cssProperty}: ${String(value)}${unit ?? ""} !important`;
}

function renderMediaQueries({
    breakpoints,
    selector,
    overridesByBreakpoint,
}: {
    breakpoints: ThemeBreakpoints;
    selector: string;
    overridesByBreakpoint: Map<keyof ThemeBreakpoints, string[]>;
}): string {
    const cssChunks: string[] = [];

    for (const [breakpointKey, declarations] of overridesByBreakpoint) {
        const breakpoint = breakpoints[breakpointKey];
        if (!breakpoint) {
            continue;
        }

        cssChunks.push(css`
            ${breakpoint.belowMediaQuery} {
                ${selector} {
                    ${declarations.join(";\n")}
                }
            }
        `);
    }

    return cssChunks.join("\n");
}
