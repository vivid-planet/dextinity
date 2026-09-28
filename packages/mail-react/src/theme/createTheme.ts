import { createBreakpoint } from "./createBreakpoint.js";
import { defaultTheme } from "./defaultTheme.js";
import type {
    Theme,
    ThemeBackgroundColors,
    ThemeBreakpoints,
    ThemeButton,
    ThemeColors,
    ThemeDivider,
    ThemeList,
    ThemeSizes,
    ThemeText,
} from "./themeTypes.js";

type CreateThemeOverrides = {
    sizes?: Partial<ThemeSizes>;
    breakpoints?: Partial<ThemeBreakpoints>;
    text?: Partial<ThemeText>;
    list?: Partial<ThemeList>;
    divider?: Partial<ThemeDivider>;
    button?: Partial<ThemeButton>;
    colors?: { background?: Partial<ThemeBackgroundColors> } & Partial<Omit<ThemeColors, "background">>;
};

/**
 * Creates a complete theme by merging optional overrides onto the default
 * theme values.
 *
 * Breakpoint overrides must be `ThemeBreakpoint` objects constructed via
 * `createBreakpoint`. Arbitrary breakpoint keys from `ThemeBreakpoints`
 * module augmentation are supported and flow through to the result.
 *
 * `breakpoints.default` is always auto-derived from `sizes.bodyWidth` unless
 * explicitly overridden.
 */
export function createTheme(overrides?: CreateThemeOverrides): Theme {
    const resolvedSizes: ThemeSizes = { ...defaultTheme.sizes, ...overrides?.sizes };

    return {
        sizes: resolvedSizes,
        breakpoints: {
            ...defaultTheme.breakpoints,
            default: createBreakpoint(resolvedSizes.bodyWidth),
            ...overrides?.breakpoints,
        },
        text: { ...defaultTheme.text, ...overrides?.text },
        list: { ...defaultTheme.list, ...overrides?.list },
        divider: { ...defaultTheme.divider, ...overrides?.divider },
        button: { ...defaultTheme.button, ...overrides?.button },
        colors: {
            ...defaultTheme.colors,
            ...overrides?.colors,
            background: { ...defaultTheme.colors.background, ...overrides?.colors?.background },
        },
    };
}
