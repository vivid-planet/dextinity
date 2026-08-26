import { cloneElement, isValidElement, type ReactNode } from "react";

export interface TipTapMark {
    type: string;
    attrs?: Record<string, unknown>;
}

export interface TipTapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TipTapNode[];
    marks?: TipTapMark[];
    text?: string;
}

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

const defaultTipTapNodeMapping: Record<string, TipTapNodeHandler> = {
    paragraph: ({ children }) => <p>{children}</p>,
    heading: ({ node, children }) => {
        const level = (node.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) ?? 1;
        const Tag = `h${level}` as const;
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
        if (node.type === "text") {
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

export function hasTipTapRichTextContent(content: TipTapNode | null | undefined): boolean {
    if (!content?.content || !Array.isArray(content.content)) {
        return false;
    }
    return content.content.some((node) => node.type !== "paragraph" || (Array.isArray(node.content) && node.content.length > 0));
}
