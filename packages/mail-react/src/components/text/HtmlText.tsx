import clsx from "clsx";
import type { ComponentPropsWithoutRef, CSSProperties, JSX, ReactNode, TdHTMLAttributes } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useTheme } from "../../theme/ThemeProvider.js";
import type { TextVariantStyles, Theme, VariantName } from "../../theme/themeTypes.js";
import { generateResponsiveTextCss } from "./generateResponsiveTextCss.js";
import { OutlookTextStyleProvider, type OutlookTextStyleValues } from "./OutlookTextStyleContext.js";

interface HtmlTextOwnProps {
    /**
     * The component's variant to apply, as defined in the theme.
     *
     * Custom variants should be defined in the theme through module augmentation:
     *
     * ```ts
     * declare module "@dextinity/mail-react" {
     *     interface TextVariants { heading: true; body: true }
     * }
     * ```
     *
     * ```ts
     * const theme = createTheme({
     *     text: {
     *         variants: {
     *             heading: { fontSize: "24px" },
     *             body: { fontSize: "16px" },
     *         },
     *     },
     * });
     * ```
     *
     * @defaultValue The theme's `text.defaultVariant`, when set
     */
    variant?: VariantName;
    /** When true, applies spacing below the text. */
    bottomSpacing?: boolean;
}

interface HtmlTextImplementationProps extends HtmlTextOwnProps {
    element?: keyof JSX.IntrinsicElements;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    [key: string]: unknown;
}

export type HtmlTextProps<E extends keyof JSX.IntrinsicElements = "td"> = HtmlTextOwnProps & {
    /**
     * The HTML element to render instead of the default `<td>`.
     *
     * @example
     * ```tsx
     * <HtmlText element="div">Rendered as a div</HtmlText>
     * <HtmlText element="a" href="/link">Rendered as an anchor</HtmlText>
     * ```
     */
    element?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof HtmlTextOwnProps | "element">;

/**
 * Themed text component for use inside MJML ending tags or outside of the MJML context.
 * Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlText` in a `<tr>` of its own,
 * and in a `<td>` too when `element` is not the default `td`.
 */
export function HtmlText<E extends keyof JSX.IntrinsicElements>(
    props: HtmlTextOwnProps & { element: E } & Omit<ComponentPropsWithoutRef<E>, keyof HtmlTextOwnProps | "element">,
): ReactNode;
export function HtmlText(props: HtmlTextOwnProps & Omit<TdHTMLAttributes<HTMLTableCellElement>, keyof HtmlTextOwnProps>): ReactNode;
export function HtmlText({
    element: Element = "td",
    variant: variantProp,
    bottomSpacing,
    className,
    style,
    children,
    ...restProps
}: HtmlTextImplementationProps): ReactNode {
    const theme = useTheme();

    const { defaultVariant, variants, ...baseStyles } = theme.text;
    const activeVariant = variantProp ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;

    const mergedStyles: TextVariantStyles = variantStyles ? { ...baseStyles, ...variantStyles } : baseStyles;

    const themeStyle: CSSProperties = {
        fontFamily: getDefaultOrUndefined(mergedStyles.fontFamily),
        fontSize: getDefaultOrUndefined(mergedStyles.fontSize),
        fontWeight: getDefaultOrUndefined(mergedStyles.fontWeight),
        fontStyle: getDefaultOrUndefined(mergedStyles.fontStyle),
        lineHeight: getDefaultOrUndefined(mergedStyles.lineHeight),
        letterSpacing: getDefaultOrUndefined(mergedStyles.letterSpacing),
        textDecoration: getDefaultOrUndefined(mergedStyles.textDecoration),
        textTransform: getDefaultOrUndefined(mergedStyles.textTransform),
        color: getDefaultOrUndefined(mergedStyles.color),
        ...(getDefaultOrUndefined(mergedStyles.lineHeight) !== undefined && { msoLineHeightRule: "exactly" }),
        ...(bottomSpacing && { paddingBottom: getDefaultOrUndefined(mergedStyles.bottomSpacing) }),
    };

    const outlookTextStyleValues: OutlookTextStyleValues = {
        fontFamily: themeStyle.fontFamily,
        fontSize: themeStyle.fontSize,
        lineHeight: themeStyle.lineHeight,
        fontWeight: themeStyle.fontWeight,
        color: themeStyle.color,
        ...(style?.fontFamily !== undefined && { fontFamily: style.fontFamily }),
        ...(style?.fontSize !== undefined && { fontSize: style.fontSize }),
        ...(style?.lineHeight !== undefined && { lineHeight: style.lineHeight }),
        ...(style?.fontWeight !== undefined && { fontWeight: style.fontWeight }),
        ...(style?.color !== undefined && { color: style.color }),
    };

    return (
        <Element
            {...restProps}
            className={clsx("htmlText", activeVariant && `htmlText--${activeVariant}`, bottomSpacing && "htmlText--bottomSpacing", className)}
            style={{ ...themeStyle, ...style }}
        >
            <OutlookTextStyleProvider value={outlookTextStyleValues}>{children}</OutlookTextStyleProvider>
        </Element>
    );
}

function generateHtmlTextStyles(theme: Theme): string {
    return generateResponsiveTextCss(theme, {
        styleSelector: (variantName) => `.htmlText--${variantName}`,
        spacingSelector: (variantName) => `.htmlText--bottomSpacing.htmlText--${variantName}`,
    });
}

registerStyles(generateHtmlTextStyles);
