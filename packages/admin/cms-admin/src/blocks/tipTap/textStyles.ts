import type { HTMLAttributes, ReactNode } from "react";

import type { TipTapTextBlockTag } from "./textBlocks";

/**
 * What a rendered text block receives: the content to render, and the applied style's name as a data
 * attribute so it reaches the DOM the way it does without a custom element.
 */
export type TipTapTextElementProps = HTMLAttributes<HTMLElement> & { "data-text-style"?: string };

/**
 * Renders a text block in the editor, so the editor previews what the site will show. Spread the
 * props onto the element that holds the content.
 *
 * `Tag` is the tag the text block is stored as, which lets one style serve several text blocks: a
 * headline style shared by heading 1 and heading 2 renders `<h1>` for one and `<h2>` for the other.
 * A list's style renders the text block of each of its items, so `Tag` is `p` there.
 */
export type TipTapTextElement = (props: TipTapTextElementProps, Tag: TipTapTextBlockTag) => ReactNode;

export interface TipTapTextBlockStyle {
    /**
     * Identifies the style. Stored in the node's `textStyle` attribute, so the site can resolve it
     * to its own typography.
     *
     * Must match the API's, otherwise the API rejects content the editor produces.
     */
    name: string;
    /**
     * Label shown in the toolbar's style select.
     */
    label: ReactNode;
    /**
     * Renders the styled text block in the editor. Without it the text block renders as its plain
     * tag, so the style only shows on the site.
     */
    element?: TipTapTextElement;
}

/**
 * A list's options. Passed in place of `true` to give the list styles.
 */
export interface TipTapListOptions {
    /**
     * Styles offered while the cursor is in the list. The style is stored on the list node, so all
     * of its items share one style while a nested list keeps its own.
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
