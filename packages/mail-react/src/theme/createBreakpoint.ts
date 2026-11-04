import type { ThemeBreakpoint } from "./themeTypes.js";

/**
 * Constructs a `ThemeBreakpoint` for use in `createTheme` overrides or
 * `ThemeBreakpoints` module augmentation. Guarantees the `belowMediaQuery`
 * string is always formatted correctly.
 */
export function createBreakpoint(value: number): ThemeBreakpoint {
    return {
        value,
        belowMediaQuery: `@media (max-width: ${value - 1}px)`,
    };
}
