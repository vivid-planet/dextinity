import type { ThemeBreakpoints } from "./themeTypes.js";

/**
 * A value that can vary per breakpoint. A plain `T` is shorthand for
 * `{ default: T }` (inline only, no responsive overrides).
 *
 * The object form requires a `default` key and optional keys matching
 * `ThemeBreakpoints` (including keys added via module augmentation).
 */
export type ResponsiveValue<T = number> = T | (Partial<Record<keyof ThemeBreakpoints, T>> & { default: T });

type ResponsiveObject<T> = Partial<Record<keyof ThemeBreakpoints, T>> & { default: T };

function isResponsiveObject<T>(value: ResponsiveValue<T>): value is ResponsiveObject<T> {
    return typeof value === "object" && value !== null && "default" in value;
}

/**
 * Returns the default (inline) value from a `ResponsiveValue`.
 * For a plain value, returns it directly. For an object, returns the `default` property.
 */
export function getDefaultFromResponsiveValue<T = number>(value: ResponsiveValue<T>): T {
    return isResponsiveObject(value) ? value.default : value;
}

/**
 * Returns the default value from a `ResponsiveValue`, or `undefined` if the
 * input is `undefined`. Useful for extracting inline prop values from optional
 * theme properties.
 */
export function getDefaultOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
    if (value === undefined) {
        return undefined;
    }
    return getDefaultFromResponsiveValue(value);
}

/**
 * Returns the non-default breakpoint overrides from a `ResponsiveValue`.
 * For a plain value, returns an empty array. For an object, returns one
 * entry per breakpoint key (excluding `default`).
 */
export function getResponsiveOverrides<T = number>(value: ResponsiveValue<T>): Array<{ breakpointKey: keyof ThemeBreakpoints; value: T }> {
    if (!isResponsiveObject(value)) {
        return [];
    }

    return (Object.entries(value) as Array<[keyof ThemeBreakpoints, T]>)
        .filter(([key]) => key !== "default")
        .map(([key, val]) => ({ breakpointKey: key, value: val }));
}
