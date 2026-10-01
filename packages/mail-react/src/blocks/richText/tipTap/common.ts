import type { PropsWithData } from "../../helpers/PropsWithData.js";
import type { BlockTypeTextProps } from "../BlockText.js";
import type { RichTextInlineRenderer, RichTextLinkHrefResolver } from "../common.js";

export interface TipTapRichTextBlockData {
    /** Tip-Tap content (`{ type: "doc", content: [...] }`), as produced by the CMS TipTapRichText block. */
    tipTapContent: unknown;
}

export type TipTapRichTextBlockProps = PropsWithData<TipTapRichTextBlockData>;

export interface CreateTipTapRichTextBlockOptions<TLinkTypes extends Record<string, unknown> = Record<string, unknown>> {
    /** Default look per text block or list, used when the editor picks no style, e.g. `{ "unordered-list": { variant: "list" } }`. */
    textBlocks?: Record<string, BlockTypeTextProps>;
    /** Look per style the editor picks, e.g. `{ title: { variant: "title" } }`. Wins over `textBlocks`. */
    textBlockStyles?: Record<string, BlockTypeTextProps>;
    /**
     * Maps the application's link block types within `link` marks to a resolver
     * returning the link's href.
     *
     * Merged on top of the built-in `external` link type. Link types without a
     * resolver render their text without a link.
     */
    linkTypes?: { [TLinkType in keyof TLinkTypes]: RichTextLinkHrefResolver<TLinkTypes[TLinkType]> };
    /**
     * Maps Tip-Tap mark types to renderers, keyed by the mark's `type`.
     *
     * Merged on top of the built-in marks (`bold`, `italic`, `underline`,
     * `strike`, `superscript`, `subscript`): use it to override a built-in mark,
     * or to render a mark the application adds.
     */
    marks?: Record<string, RichTextInlineRenderer>;
    /**
     * Maps the inline styles the application defines in its RTE — the
     * `inlineStyles` option of the CMS TipTapRichText block — to renderers.
     *
     * Has no built-ins: an inline style this option does not name renders its
     * text unchanged.
     */
    inlineStyles?: Record<string, RichTextInlineRenderer>;
}
