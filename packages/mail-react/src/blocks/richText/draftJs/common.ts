import type { PropsWithData } from "../../helpers/PropsWithData.js";
import type { RichTextBlockTypeProps, RichTextInlineRenderer, RichTextLinkHrefResolver } from "../common.js";

export interface RichTextBlockData {
    /** Draft.js raw content state (`{ blocks, entityMap }`), as produced by the CMS RichText block. */
    draftContent: unknown;
}

export type RichTextBlockProps = PropsWithData<RichTextBlockData>;

export interface CreateRichTextBlockOptions<TLinkTypes extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Maps draft block types (e.g. `"header-one"`, `"paragraph-standard"`) to how
     * they render.
     *
     * Unmapped block types render as paragraphs with the base theme text styles,
     * apart from `unordered-list-item` and `ordered-list-item`.
     */
    blockTypes?: Record<string, RichTextBlockTypeProps>;
    /**
     * Maps the application's link block types within `LINK` entities to a
     * resolver returning the link's href.
     *
     * Merged on top of the built-in `external` link type. Link types without
     * a resolver render their text without a link.
     */
    linkTypes?: { [TLinkType in keyof TLinkTypes]: RichTextLinkHrefResolver<TLinkTypes[TLinkType]> };
    /**
     * Maps draft-js inline style names to renderers, keyed by the style name as
     * it appears in the content's `inlineStyleRanges`.
     *
     * Merged on top of the built-in styles (`BOLD`, `ITALIC`, `SUB`, `SUP`,
     * `STRIKETHROUGH`): use it to override a built-in style, or to render a
     * custom inline style the application defines in its RTE (e.g. `HIGHLIGHT`),
     * which has no built-in renderer.
     */
    inline?: Record<string, RichTextInlineRenderer>;
}
