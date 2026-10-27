import { cloneElement, isValidElement, type ReactNode } from "react";

import type { TipTapMark, TipTapNode } from "../../blocks.generated";

export type { TipTapMark, TipTapNode };

export interface TipTapNodeHandlerProps {
    node: TipTapNode;
    parent?: TipTapNode;
    children: ReactNode;
}

export interface TipTapMarkHandlerProps {
    mark: TipTapMark;
    node: TipTapNode;
    children: ReactNode;
}

export type TipTapNodeHandler = (props: TipTapNodeHandlerProps) => ReactNode;
export type TipTapMarkHandler = (props: TipTapMarkHandlerProps) => ReactNode;

export interface RenderTipTapRichTextOptions {
    content: TipTapNode;
    nodeMapping?: Record<string, TipTapNodeHandler>;
    markMapping?: Record<string, TipTapMarkHandler>;
}

const nonBreakingSpace = String.fromCodePoint(0xa0);
const softHyphen = String.fromCodePoint(0xad);

// The text blocks the API and the Admin configure by default. Which tag a text block renders as
// follows from the block's configuration, which the site doesn't have, so only these names can be
// mapped here - a block that renames them or adds one of its own needs a `textBlock` handler.
const defaultTextBlockTags: Record<string, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
    "heading-1": "h1",
    "heading-2": "h2",
    "heading-3": "h3",
    "heading-4": "h4",
    "heading-5": "h5",
    "heading-6": "h6",
};

const defaultTipTapNodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ node, children }) => {
        const Tag = defaultTextBlockTags[node.attrs?.textBlock as string] ?? "p";
        return <Tag>{children}</Tag>;
    },
    bulletList: ({ children }) => <ul>{children}</ul>,
    orderedList: ({ children }) => <ol>{children}</ol>,
    listItem: ({ children }) => <li>{children}</li>,
    hardBreak: () => <br />,
    nonBreakingSpace: () => nonBreakingSpace,
    softHyphen: () => softHyphen,
};

const defaultTipTapMarkMapping: Record<string, TipTapMarkHandler> = {
    bold: ({ children }) => <strong>{children}</strong>,
    italic: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    strike: ({ children }) => <s>{children}</s>,
    superscript: ({ children }) => <sup>{children}</sup>,
    subscript: ({ children }) => <sub>{children}</sub>,
};

/**
 * @experimental
 */
export function renderTipTapRichText({ content, nodeMapping, markMapping }: RenderTipTapRichTextOptions): ReactNode {
    const mergedNodeMapping = { ...defaultTipTapNodeMapping, ...nodeMapping };
    const mergedMarkMapping = { ...defaultTipTapMarkMapping, ...markMapping };
    const applyMarks = (children: ReactNode, node: TipTapNode): ReactNode => {
        if (!node.marks || node.marks.length === 0) {
            return children;
        }
        let result = children;
        for (const mark of node.marks) {
            const handler = mergedMarkMapping[mark.type];
            if (handler) {
                result = handler({ mark, node, children: result });
            }
        }
        return result;
    };

    const renderNode = (node: TipTapNode, parent: TipTapNode | undefined): ReactNode => {
        if (!node.type || node.type === "text") {
            return applyMarks(node.text ?? "", node);
        }

        const renderedChildren = node.content?.map((child, index) => {
            const rendered = renderNode(child, node);
            return isValidElement(rendered) ? cloneElement(rendered, { key: index }) : rendered;
        });

        if (node.type === "doc") {
            return <>{renderedChildren}</>;
        }

        const handler = mergedNodeMapping[node.type];
        const rendered = handler ? handler({ node, parent, children: renderedChildren }) : <>{renderedChildren}</>;
        return applyMarks(rendered, node);
    };

    return renderNode(content, undefined);
}

// A block starts out with one empty text block, so a document holding nothing else counts as empty -
// whichever text block that is.
const isEmptyableTextBlock = (node: TipTapNode): boolean => node.type === "textBlock";

export function hasTipTapRichTextContent(content: TipTapNode | null | undefined): boolean {
    if (!content?.content || !Array.isArray(content.content)) {
        return false;
    }
    return content.content.some((node) => !isEmptyableTextBlock(node) || (Array.isArray(node.content) && node.content.length > 0));
}
