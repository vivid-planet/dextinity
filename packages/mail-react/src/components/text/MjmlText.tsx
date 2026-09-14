import { type IMjmlTextProps, MjmlText as BaseMjmlText } from "@faire/mjml-react";
import clsx from "clsx";
import type { ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { TextVariantStyles, Theme, VariantName } from "../../theme/themeTypes.js";
import { generateResponsiveTextCss } from "./generateResponsiveTextCss.js";
import { OutlookTextStyleProvider, type OutlookTextStyleValues } from "./OutlookTextStyleContext.js";

export type MjmlTextProps = IMjmlTextProps & {
    /**
     * The component's variant to apply, as defined in the theme.
     *
     * Custom variants should be defined in the theme, through module augmentation.
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
};

/**
 * Text component that can be styled using the theme, optionally using a variant.
 *
 * Works without a `ThemeProvider` as a plain pass-through to the base MJML text component.
 * The `variant` and `bottomSpacing` props require a `ThemeProvider` (or `MjmlMailRoot`).
 */
export function MjmlText({ variant: variantProp, bottomSpacing, className, children, ...restProps }: MjmlTextProps): ReactNode {
    const theme = useOptionalTheme();

    const themedProps = getThemedProps(theme, variantProp, bottomSpacing, restProps);

    const resolvedClassName = clsx(
        "mjmlText",
        themedProps.activeVariant && `mjmlText--${themedProps.activeVariant}`,
        bottomSpacing && "mjmlText--bottomSpacing",
        className,
    );

    return (
        <BaseMjmlText {...themedProps.baseProps} className={resolvedClassName} {...restProps}>
            {themedProps.outlookTextStyleValues !== null ? (
                <OutlookTextStyleProvider value={themedProps.outlookTextStyleValues}>{children}</OutlookTextStyleProvider>
            ) : (
                children
            )}
        </BaseMjmlText>
    );
}

function getThemedProps(
    theme: Theme | null,
    variantProp: VariantName | undefined,
    bottomSpacing: boolean | undefined,
    explicitProps: Partial<IMjmlTextProps>,
): { activeVariant: VariantName | undefined; baseProps: Partial<IMjmlTextProps>; outlookTextStyleValues: OutlookTextStyleValues | null } {
    if (theme === null) {
        if (variantProp !== undefined) {
            throw new Error("The `variant` prop requires being wrapped in a ThemeProvider or MjmlMailRoot.");
        }
        if (bottomSpacing) {
            throw new Error("The `bottomSpacing` prop requires being wrapped in a ThemeProvider or MjmlMailRoot.");
        }
        return { activeVariant: undefined, baseProps: {}, outlookTextStyleValues: null };
    }

    const { defaultVariant, variants, ...baseStyles } = theme.text;
    const activeVariant = variantProp ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;

    const mergedStyles: TextVariantStyles = variantStyles ? { ...baseStyles, ...variantStyles } : baseStyles;

    const fontWeightDefault = getDefaultOrUndefined(mergedStyles.fontWeight);

    return {
        activeVariant,
        baseProps: {
            fontFamily: getDefaultOrUndefined(mergedStyles.fontFamily),
            fontSize: getDefaultOrUndefined(mergedStyles.fontSize),
            fontWeight: fontWeightDefault !== undefined ? String(fontWeightDefault) : undefined,
            fontStyle: getDefaultOrUndefined(mergedStyles.fontStyle),
            lineHeight: getDefaultOrUndefined(mergedStyles.lineHeight),
            letterSpacing: getDefaultOrUndefined(mergedStyles.letterSpacing),
            textDecoration: getDefaultOrUndefined(mergedStyles.textDecoration),
            textTransform: getDefaultOrUndefined(mergedStyles.textTransform),
            color: getDefaultOrUndefined(mergedStyles.color),
            paddingBottom: bottomSpacing ? getDefaultOrUndefined(mergedStyles.bottomSpacing) : undefined,
        },
        outlookTextStyleValues: {
            fontFamily: explicitProps.fontFamily ?? getDefaultOrUndefined(mergedStyles.fontFamily),
            fontSize: explicitProps.fontSize ?? getDefaultOrUndefined(mergedStyles.fontSize),
            fontWeight: explicitProps.fontWeight ?? fontWeightDefault,
            lineHeight: explicitProps.lineHeight ?? getDefaultOrUndefined(mergedStyles.lineHeight),
            color: explicitProps.color ?? getDefaultOrUndefined(mergedStyles.color),
        },
    };
}

export function generateMjmlTextStyles(theme: Theme): string {
    return generateResponsiveTextCss(theme, {
        styleSelector: (variantName) => `.mjmlText--${variantName} > div`,
        spacingSelector: (variantName) => `.mjmlText--bottomSpacing.mjmlText--${variantName}`,
    });
}

registerStyles(generateMjmlTextStyles);
