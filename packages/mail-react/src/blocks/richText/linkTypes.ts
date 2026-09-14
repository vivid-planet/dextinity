import type { RichTextLinkHrefResolver } from "./common.js";

function resolveExternalLinkHref(props: unknown): string | undefined {
    if (typeof props !== "object" || props === null || !("targetUrl" in props)) {
        return undefined;
    }

    const { targetUrl } = props;

    return typeof targetUrl === "string" ? targetUrl : undefined;
}

const builtInLinkTypes: Record<string, RichTextLinkHrefResolver> = {
    external: resolveExternalLinkHref,
};

export function mergeLinkTypes<TLinkTypes extends Record<string, unknown>>(
    linkTypes: { [TLinkType in keyof TLinkTypes]: RichTextLinkHrefResolver<TLinkTypes[TLinkType]> } | undefined,
): Record<string, RichTextLinkHrefResolver> {
    return {
        ...builtInLinkTypes,
        // Link props are `unknown` at runtime. The cast is confined to this one place so that each
        // resolver can declare the props of its own link type instead of narrowing `unknown` again.
        ...(linkTypes as Record<string, RichTextLinkHrefResolver> | undefined),
    };
}

/**
 * Reads the active attached block of a link block created with `createLinkBlock`.
 *
 * Only that shape is supported. When a rich text block is configured with a link block that
 * keeps its target in its own fields, there is no attached block to read, and the text it
 * spans is rendered without a link.
 */
export function getLinkBlock(linkData: unknown): { type: string; props: unknown } | undefined {
    if (typeof linkData !== "object" || linkData === null || !("block" in linkData)) {
        return undefined;
    }

    const { block } = linkData;

    if (typeof block !== "object" || block === null || !("type" in block) || !("props" in block)) {
        return undefined;
    }

    const { type, props } = block;

    return typeof type === "string" ? { type, props } : undefined;
}
