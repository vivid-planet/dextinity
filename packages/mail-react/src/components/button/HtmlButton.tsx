import clsx from "clsx";
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { defaultTheme } from "../../theme/defaultTheme.js";
import { getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { ButtonVariantStyles, Theme, ThemeButton } from "../../theme/themeTypes.js";
import type { ButtonProps } from "./buttonProps.js";
import { defaultButtonStyles } from "./defaultButtonStyles.js";
import { generateResponsiveButtonCss } from "./generateResponsiveButtonCss.js";

export type HtmlButtonProps = ButtonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>;

/**
 * Themed button for use inside MJML ending tags or outside of the MJML context.
 * Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlButton` in a `<tr>` and `<td>` of its own.
 * For MJML context, use `MjmlButton`.
 */
export function HtmlButton({
    variant: variantProp,
    fullWidth,
    target = "_blank",
    href = "#",
    className,
    style,
    children,
    ...restProps
}: HtmlButtonProps): ReactNode {
    const theme = useOptionalTheme();

    if (theme === null && variantProp !== undefined) {
        throw new Error("The `variant` prop requires being wrapped in a ThemeProvider or MjmlMailRoot.");
    }

    const themeButton: ThemeButton = theme?.button ?? defaultButtonStyles;
    const textStyles = theme?.text ?? defaultTheme.text;
    const { defaultVariant, variants, ...baseStyles } = themeButton;
    const activeVariant = variantProp ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;

    const mergedStyles: ButtonVariantStyles = { ...baseStyles, ...variantStyles };

    const backgroundColor = getDefaultOrUndefined(mergedStyles.backgroundColor);
    const borderRadius = getDefaultOrUndefined(mergedStyles.borderRadius);
    const innerPadding = getDefaultOrUndefined(mergedStyles.padding);

    const cellStyle: CSSProperties = {
        border: getDefaultOrUndefined(mergedStyles.border),
        borderRadius,
        backgroundColor,
        msoPaddingAlt: innerPadding,
    };

    const anchorStyle: CSSProperties = {
        display: fullWidth ? "block" : "inline-block",
        backgroundColor,
        backgroundImage: getDefaultOrUndefined(mergedStyles.backgroundImage),
        color: getDefaultOrUndefined(mergedStyles.color),
        fontFamily: getDefaultOrUndefined(mergedStyles.fontFamily) ?? textStyles.fontFamily,
        fontSize: getDefaultOrUndefined(mergedStyles.fontSize) ?? textStyles.fontSize,
        fontWeight: getDefaultOrUndefined(mergedStyles.fontWeight) ?? textStyles.fontWeight,
        lineHeight: getDefaultOrUndefined(mergedStyles.lineHeight) ?? textStyles.lineHeight,
        margin: 0,
        textAlign: "center",
        textDecoration: "none",
        padding: innerPadding,
        borderRadius,
        msoPaddingAlt: "0px",
        ...style,
    };

    return (
        <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width={fullWidth ? "100%" : undefined}
            className={clsx("htmlButton", activeVariant && `htmlButton--${activeVariant}`, fullWidth && "htmlButton--fullWidth", className)}
            style={{ borderCollapse: "separate", lineHeight: "100%", msoLineHeightRule: "exactly" }}
        >
            <tbody>
                <tr>
                    <td align="center" valign="middle" bgcolor={backgroundColor} style={cellStyle}>
                        <a {...restProps} href={href} target={target} style={anchorStyle}>
                            {children}
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export function generateHtmlButtonStyles(theme: Theme): string {
    return generateResponsiveButtonCss(theme, {
        styleSelector: (variantName) => `.htmlButton--${variantName} a`,
    });
}

registerStyles(generateHtmlButtonStyles);
