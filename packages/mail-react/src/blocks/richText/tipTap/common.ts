import type { PropsWithData } from "../../helpers/PropsWithData.js";
import type { RichTextBlockTypeProps, RichTextInlineRenderer, RichTextLinkHrefResolver } from "../common.js";

export interface TipTapRichTextBlockData {
    /** Tip-Tap content (`{ type: "doc", content: [...] }`), as produced by the CMS TipTapRichText block. */
    tipTapContent: unknown;
}

export type TipTapRichTextBlockProps = PropsWithData<TipTapRichTextBlockData>;

/** The kinds of text block a Tip-Tap rich text block can hold, named as the CMS block's `appliesTo` names them. */
export type TipTapTextBlockType =
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "heading-6"
    | "unordered-list"
    | "ordered-list";

export interface CreateTipTapRichTextBlockOptions<TLinkTypes extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Maps text block types to the styling of the text component that renders
     * them.
     *
     * Unmapped block types render with the base theme text styles.
     */
    blockTypes?: Partial<Record<TipTapTextBlockType, RichTextBlockTypeProps>>;
    /**
     * Maps the text block styles the application defines in its RTE — the
     * `textBlockStyles` option of the CMS TipTapRichText block — to the styling
     * of the text component.
     *
     * Takes precedence over the `blockTypes` entry for the same text block. A style the
     * editor applied but this option does not name falls back to that entry.
     */
    textBlockStyles?: Record<string, RichTextBlockTypeProps>;
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
