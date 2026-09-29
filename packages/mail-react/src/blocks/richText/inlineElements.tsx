import type { RichTextInlineRenderer } from "./common.js";

// The explicit styles below back up the semantic tags in rendering engines that don't apply their default styling.

export const renderBoldText: RichTextInlineRenderer = (children, { key }) => (
    <strong key={key} style={{ fontWeight: "bold" }}>
        {children}
    </strong>
);

export const renderItalicText: RichTextInlineRenderer = (children, { key }) => (
    <em key={key} style={{ fontStyle: "italic" }}>
        {children}
    </em>
);

export const renderStrikethroughText: RichTextInlineRenderer = (children, { key }) => <s key={key}>{children}</s>;

export const renderSubscriptText: RichTextInlineRenderer = (children, { key }) => <sub key={key}>{children}</sub>;

export const renderSuperscriptText: RichTextInlineRenderer = (children, { key }) => <sup key={key}>{children}</sup>;
