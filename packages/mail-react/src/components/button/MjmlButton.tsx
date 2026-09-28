import { type IMjmlButtonProps, MjmlButton as BaseMjmlButton } from "@faire/mjml-react";
import clsx from "clsx";
import type { ReactNode } from "react";

import { registerStyles } from "../../styles/registerStyles.js";
import { getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { ButtonVariantName, ButtonVariantStyles, Theme, ThemeButton } from "../../theme/themeTypes.js";
import { css } from "../../utils/css.js";
import type { ButtonProps } from "./buttonProps.js";
import { defaultButtonStyles } from "./defaultButtonStyles.js";
import { generateResponsiveButtonCss } from "./generateResponsiveButtonCss.js";

export type MjmlButtonProps = Omit<IMjmlButtonProps, "href" | "target"> & ButtonProps;

/**
 * Themed button for use inside an `MjmlColumn`.
 */
export function MjmlButton({
    variant: variantProp,
    fullWidth,
    width,
    href = "#",
    target = "_blank",
    className,
    children,
    ...restProps
}: MjmlButtonProps): ReactNode {
    const theme = useOptionalTheme();

    const themedProps = getThemedProps(theme, variantProp);

    return (
        <BaseMjmlButton
            {...themedProps.baseProps}
            {...restProps}
            href={href}
            target={target}
            width={fullWidth ? "100%" : width}
            className={clsx(
                "mjmlButton",
                themedProps.activeVariant && `mjmlButton--${themedProps.activeVariant}`,
                fullWidth && "mjmlButton--fullWidth",
                className,
            )}
        >
            {children}
        </BaseMjmlButton>
    );
}

function getThemedProps(
    theme: Theme | null,
    variantProp: ButtonVariantName | undefined,
): { activeVariant: ButtonVariantName | undefined; baseProps: Partial<IMjmlButtonProps> } {
    if (theme === null && variantProp !== undefined) {
        throw new Error("The `variant` prop requires being wrapped in a ThemeProvider or MjmlMailRoot.");
    }

    const themeButton: ThemeButton = theme?.button ?? defaultButtonStyles;
    const { defaultVariant, variants, ...baseStyles } = themeButton;
    const activeVariant = variantProp ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;

    const mergedStyles: ButtonVariantStyles = { ...baseStyles, ...variantStyles };

    const fontWeightDefault = getDefaultOrUndefined(mergedStyles.fontWeight);

    return {
        activeVariant,
        baseProps: {
            color: getDefaultOrUndefined(mergedStyles.color),
            backgroundColor: getDefaultOrUndefined(mergedStyles.backgroundColor),
            border: getDefaultOrUndefined(mergedStyles.border),
            borderRadius: getDefaultOrUndefined(mergedStyles.borderRadius),
            fontFamily: getDefaultOrUndefined(mergedStyles.fontFamily),
            fontSize: getDefaultOrUndefined(mergedStyles.fontSize),
            fontWeight: fontWeightDefault !== undefined ? String(fontWeightDefault) : undefined,
            lineHeight: getDefaultOrUndefined(mergedStyles.lineHeight),
            innerPadding: getDefaultOrUndefined(mergedStyles.padding),
        },
    };
}

// The wrapped MJML button has no `background-image` prop, so the value can only come from CSS. The
// `!important` beats the `background` shorthand the button writes inline, which would reset the gradient.
export function generateInlineBackgroundImageCss(theme: Theme): string {
    const { variants, ...baseStyles } = theme.button;
    const cssChunks: string[] = [];

    const baseBackgroundImage = getDefaultOrUndefined(baseStyles.backgroundImage);
    if (baseBackgroundImage !== undefined) {
        cssChunks.push(css`
            .mjmlButton a {
                background-image: ${baseBackgroundImage} !important;
            }
        `);
    }

    if (variants) {
        for (const [variantName, variantStyles] of Object.entries(variants)) {
            const backgroundImage = getDefaultOrUndefined(variantStyles?.backgroundImage);
            if (backgroundImage !== undefined) {
                cssChunks.push(css`
                    .mjmlButton--${variantName} a {
                        background-image: ${backgroundImage} !important;
                    }
                `);
            }
        }
    }

    return cssChunks.join("\n");
}

export function generateMjmlButtonStyles(theme: Theme): string {
    return generateResponsiveButtonCss(theme, {
        styleSelector: (variantName) => `.mjmlButton--${variantName} a`,
    });
}

registerStyles(generateMjmlButtonStyles);

registerStyles(generateInlineBackgroundImageCss, { inline: true });

// The cell is already full-width; this widens the anchor inside it so a gradient covers the
// whole bar and the whole bar is clickable. Inlined so it survives clients that drop `<style>`.
registerStyles(
    css`
        .mjmlButton--fullWidth a {
            display: block !important;
            text-align: center !important;
        }
    `,
    { inline: true },
);
