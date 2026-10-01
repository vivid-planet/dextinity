import type { CSSProperties } from "react";

import { getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import type { TextVariantStyles, ThemeText, VariantName } from "../../theme/themeTypes.js";

interface ResolvedTextVariant {
    activeVariant?: VariantName;
    mergedStyles: TextVariantStyles;
}

export function resolveTextVariant(themeText: ThemeText, variant?: VariantName): ResolvedTextVariant {
    const { defaultVariant, variants, ...baseStyles } = themeText;
    const activeVariant = variant ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;

    return { activeVariant, mergedStyles: variantStyles ? { ...baseStyles, ...variantStyles } : baseStyles };
}

export function getDefaultTextStyle(styles: TextVariantStyles): CSSProperties {
    return {
        fontFamily: getDefaultOrUndefined(styles.fontFamily),
        fontSize: getDefaultOrUndefined(styles.fontSize),
        fontWeight: getDefaultOrUndefined(styles.fontWeight),
        fontStyle: getDefaultOrUndefined(styles.fontStyle),
        lineHeight: getDefaultOrUndefined(styles.lineHeight),
        letterSpacing: getDefaultOrUndefined(styles.letterSpacing),
        textDecoration: getDefaultOrUndefined(styles.textDecoration),
        textTransform: getDefaultOrUndefined(styles.textTransform),
        color: getDefaultOrUndefined(styles.color),
    };
}
