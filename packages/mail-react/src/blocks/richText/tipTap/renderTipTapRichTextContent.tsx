import type { ComponentType, ReactNode } from "react";

import { HtmlInlineLink } from "../../../components/inlineLink/HtmlInlineLink.js";
import type { BlockTextProps } from "../BlockText.js";
import type { RichTextBlockTypeProps, RichTextInlineRenderer, RichTextLinkHrefResolver } from "../common.js";
import {
    renderBoldText,
    renderItalicText,
    renderStrikethroughText,
    renderSubscriptText,
    renderSuperscriptText,
    renderUnderlineText,
} from "../inlineElements.js";
import { getLinkBlock } from "../linkTypes.js";
import { RichTextList, type RichTextListItem } from "../RichTextList.js";
import type { TipTapTextBlockType } from "./common.js";

interface TipTapMark {
    type: string;
    attrs?: Record<string, unknown>;
}

interface TipTapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TipTapNode[];
    marks?: TipTapMark[];
    text?: string;
}

function isTipTapNode(node: unknown): node is TipTapNode {
    return typeof node === "object" && node !== null && "type" in node && typeof node.type === "string";
}

function isTipTapDoc(content: unknown): content is { content: TipTapNode[] } {
    if (typeof content !== "object" || content === null || !("type" in content) || !("content" in content)) {
        return false;
    }

    return content.type === "doc" && Array.isArray(content.content) && content.content.every(isTipTapNode);
}

const builtInMarkRenderers: Record<string, RichTextInlineRenderer> = {
    bold: renderBoldText,
    italic: renderItalicText,
    underline: renderUnderlineText,
    strike: renderStrikethroughText,
    superscript: renderSuperscriptText,
    subscript: renderSubscriptText,
};

const nonBreakingSpace = String.fromCodePoint(0xa0);
const softHyphen = String.fromCodePoint(0xad);

interface RenderContext {
    blockTypes: Partial<Record<TipTapTextBlockType, RichTextBlockTypeProps>>;
    textBlockStyles: Record<string, RichTextBlockTypeProps>;
    linkTypes: Record<string, RichTextLinkHrefResolver>;
    marks: Record<string, RichTextInlineRenderer>;
    inlineStyles: Record<string, RichTextInlineRenderer>;
    blockTextComponent: ComponentType<BlockTextProps>;
}

const headingBlockTypes: Partial<Record<number, TipTapTextBlockType>> = {
    1: "heading-1",
    2: "heading-2",
    3: "heading-3",
    4: "heading-4",
    5: "heading-5",
    6: "heading-6",
};

function getTextBlockType(node: TipTapNode): TipTapTextBlockType | undefined {
    if (node.type === "paragraph") {
        return "paragraph";
    }

    if (node.type === "heading" && typeof node.attrs?.level === "number") {
        return headingBlockTypes[node.attrs.level];
    }

    return undefined;
}

function isListNode(node: TipTapNode): boolean {
    return node.type === "bulletList" || node.type === "orderedList";
}

/** The editor stores a list's style on the paragraph inside each item, not on the list. */
function getListTextBlockStyle(listNode: TipTapNode): unknown {
    const firstItem = listNode.content?.find((child) => child.type === "listItem");
    const firstParagraph = firstItem?.content?.find((child) => child.type === "paragraph");

    return firstParagraph?.attrs?.textBlockStyle;
}

function resolveBlockTypeProps({
    textBlockStyle,
    blockType,
    context,
}: {
    textBlockStyle: unknown;
    blockType: TipTapTextBlockType | undefined;
    context: RenderContext;
}): RichTextBlockTypeProps {
    if (typeof textBlockStyle === "string" && context.textBlockStyles[textBlockStyle] !== undefined) {
        return context.textBlockStyles[textBlockStyle];
    }

    return (blockType && context.blockTypes[blockType]) ?? {};
}

function applyMarks({
    children,
    marks,
    path,
    context,
}: {
    children: ReactNode;
    marks: TipTapMark[];
    path: string;
    context: RenderContext;
}): ReactNode {
    return marks.reduce<ReactNode>((markedChildren, mark, index) => {
        const key = `${path}-mark-${String(index)}`;

        if (mark.type === "link") {
            const linkBlock = getLinkBlock(mark.attrs?.data);

            if (linkBlock === undefined) {
                return markedChildren;
            }

            const href = context.linkTypes[linkBlock.type]?.(linkBlock.props);

            if (href === undefined) {
                return markedChildren;
            }

            return (
                <HtmlInlineLink key={key} className="richTextBlock__link" href={href}>
                    {markedChildren}
                </HtmlInlineLink>
            );
        }

        if (mark.type === "inlineStyle") {
            const inlineStyle = mark.attrs?.type;
            const renderInlineStyle = typeof inlineStyle === "string" ? context.inlineStyles[inlineStyle] : undefined;

            return renderInlineStyle ? renderInlineStyle(markedChildren, { key }) : markedChildren;
        }

        const renderMark = context.marks[mark.type];

        return renderMark ? renderMark(markedChildren, { key }) : markedChildren;
    }, children);
}

function renderInlineNodeContent({ node, path, context }: { node: TipTapNode; path: string; context: RenderContext }): ReactNode {
    switch (node.type) {
        case "text":
            return node.text ?? "";
        case "hardBreak":
            return <br key={path} />;
        case "nonBreakingSpace":
            return nonBreakingSpace;
        case "softHyphen":
            return softHyphen;
        case "placeholder":
            return `{{${typeof node.attrs?.name === "string" ? node.attrs.name : ""}}}`;
        case "cmsBlock":
        case "cmsInlineBlock":
            return null;
        default:
            return renderInlineNodes({ nodes: node.content ?? [], path, context });
    }
}

function renderInlineNodes({ nodes, path, context }: { nodes: TipTapNode[]; path: string; context: RenderContext }): ReactNode[] {
    return nodes.map((node, index) => {
        const nodePath = `${path}-${String(index)}`;

        return applyMarks({
            children: renderInlineNodeContent({ node, path: nodePath, context }),
            marks: node.marks ?? [],
            path: nodePath,
            context,
        });
    });
}

function renderListItemContent({ item, path, depth, context }: { item: TipTapNode; path: string; depth: number; context: RenderContext }): ReactNode {
    const content: ReactNode[] = [];
    let textBlockCount = 0;

    for (const [index, child] of (item.content ?? []).entries()) {
        const childPath = `${path}-${String(index)}`;

        if (isListNode(child)) {
            content.push(renderNestedList({ node: child, path: childPath, depth: depth + 1, context }));
            continue;
        }

        // The item's text blocks share one table cell, which cannot hold block-level elements.
        if (textBlockCount > 0) {
            content.push(<br key={`${childPath}-break`} />);
        }

        textBlockCount += 1;
        content.push(...renderInlineNodes({ nodes: child.content ?? [], path: childPath, context }));
    }

    return content;
}

function renderListItems({
    node,
    path,
    depth,
    context,
}: {
    node: TipTapNode;
    path: string;
    depth: number;
    context: RenderContext;
}): RichTextListItem[] {
    const items: RichTextListItem[] = [];

    for (const [index, item] of (node.content ?? []).entries()) {
        if (item.type !== "listItem") {
            continue;
        }

        const itemPath = `${path}-${String(index)}`;

        items.push({ key: itemPath, content: renderListItemContent({ item, path: itemPath, depth, context }) });
    }

    return items;
}

function renderNestedList({ node, path, depth, context }: { node: TipTapNode; path: string; depth: number; context: RenderContext }): ReactNode {
    // No text component of its own: MJML does not process the content of an ending tag, so a nested one would stay in the
    // compiled mail as a literal `mj-text` tag.
    return <RichTextList key={path} ordered={node.type === "orderedList"} depth={depth} items={renderListItems({ node, path, depth, context })} />;
}

function renderList({ node, path, isLast, context }: { node: TipTapNode; path: string; isLast: boolean; context: RenderContext }): ReactNode {
    const BlockText = context.blockTextComponent;
    const ordered = node.type === "orderedList";
    const blockTypeProps = resolveBlockTypeProps({
        textBlockStyle: getListTextBlockStyle(node),
        blockType: ordered ? "ordered-list" : "unordered-list",
        context,
    });

    return (
        <BlockText
            key={path}
            bottomSpacing={false} // The list holds this space itself — applying it here too would double it.
            {...blockTypeProps}
        >
            <RichTextList
                ordered={ordered}
                variant={blockTypeProps.variant}
                bottomSpacing={!isLast}
                depth={0}
                items={renderListItems({ node, path, depth: 0, context })}
            />
        </BlockText>
    );
}

function renderTextBlock({ node, path, isLast, context }: { node: TipTapNode; path: string; isLast: boolean; context: RenderContext }): ReactNode {
    const BlockText = context.blockTextComponent;
    const blockTypeProps = resolveBlockTypeProps({ textBlockStyle: node.attrs?.textBlockStyle, blockType: getTextBlockType(node), context });

    return (
        <BlockText key={path} bottomSpacing={!isLast} {...blockTypeProps}>
            {renderInlineNodes({ nodes: node.content ?? [], path, context })}
        </BlockText>
    );
}

interface RenderTipTapRichTextContentOptions extends RenderContext {
    tipTapContent: unknown;
}

export function renderTipTapRichTextContent({ tipTapContent, marks, ...contextOptions }: RenderTipTapRichTextContentOptions): ReactNode {
    if (!isTipTapDoc(tipTapContent)) {
        return null;
    }

    const textBlocks = tipTapContent.content.filter((node) => (node.content?.length ?? 0) > 0);

    if (textBlocks.length === 0) {
        return null;
    }

    const context: RenderContext = { ...contextOptions, marks: { ...builtInMarkRenderers, ...marks } };

    return textBlocks.map((node, index) => {
        const path = String(index);
        const isLast = index === textBlocks.length - 1;

        return isListNode(node) ? renderList({ node, path, isLast, context }) : renderTextBlock({ node, path, isLast, context });
    });
}
