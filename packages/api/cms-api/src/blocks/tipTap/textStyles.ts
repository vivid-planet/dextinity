export interface TipTapTextBlockStyle {
    /**
     * Identifies the style. Stored in the node's `textStyle` attribute, so the site can resolve it
     * to its own typography.
     */
    name: string;
}

/**
 * A list's options. Passed in place of `true` to give the list styles.
 */
export interface TipTapListOptions {
    /**
     * Styles offered for the list. The style is stored on the list node, so a nested list carries
     * its own.
     */
    styles?: TipTapTextBlockStyle[];
}

export interface TipTapResolvedList {
    enabled: boolean;
    styles: TipTapTextBlockStyle[];
}

/**
 * Applies the default to a style configuration and rejects duplicate names, which would make the
 * stored `textStyle` ambiguous.
 */
export function resolveStyles(styles: TipTapTextBlockStyle[] | undefined, context: string): TipTapTextBlockStyle[] {
    if (!styles) {
        return [];
    }

    const names = new Set<string>();
    for (const style of styles) {
        if (names.has(style.name)) {
            throw new Error(`Duplicate style name "${style.name}" in ${context}`);
        }
        names.add(style.name);
    }

    return styles;
}

export function resolveList(
    list: boolean | TipTapListOptions | undefined,
    { enabledByDefault, context }: { enabledByDefault: boolean; context: string },
): TipTapResolvedList {
    return {
        enabled: list === undefined ? enabledByDefault : list !== false,
        styles: typeof list === "object" ? resolveStyles(list.styles, context) : [],
    };
}

export const findStyle = (styles: TipTapTextBlockStyle[], name?: string | null): TipTapTextBlockStyle | undefined =>
    styles.find((style) => style.name === name);
