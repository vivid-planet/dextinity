import type { ReactNode } from "react";

import type { TextStyles, VariantName } from "../../theme/themeTypes.js";

export type RichTextListKind = "unordered" | "ordered";

/**
 * Styling and list kind for all text blocks of one type, on top of the base theme text styles.
 *
 * Style props accept plain values only. For responsive styling, use a theme
 * variant, or set a `className` and register responsive CSS via `registerStyles`.
 */
export type RichTextBlockTypeProps = Omit<TextStyles, "bottomSpacing"> & {
    /**
     * The text component's variant to apply, as defined in the theme.
     *
     * @defaultValue The theme's `text.defaultVariant`, when set
     */
    variant?: VariantName;
    className?: string;
    /** Renders every text block of this type as a list of this kind. */
    list?: RichTextListKind;
};

/**
 * Resolves the href of one link block type from the link block's props.
 *
 * Return `undefined` to render the linked text without a link.
 */
export type RichTextLinkHrefResolver<TProps = unknown> = (props: TProps) => string | undefined;

/**
 * Renders the text spanned by one piece of inline formatting.
 *
 * `key` must be set on the returned element's root.
 */
export type RichTextInlineRenderer = (children: ReactNode, options: { key: string }) => ReactNode;
