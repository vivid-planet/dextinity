import type { ComponentType, ReactNode } from "react";
import type { Renderers, TextBlockRenderFn } from "redraft";

import { HtmlInlineLink } from "../../../components/inlineLink/HtmlInlineLink.js";
import type { BlockTextProps, BlockTypeTextProps } from "../BlockText.js";
import type { RichTextBlockTypeProps, RichTextInlineRenderer, RichTextLinkHrefResolver, RichTextListKind } from "../common.js";
import { renderBoldText, renderItalicText, renderStrikethroughText, renderSubscriptText, renderSuperscriptText } from "../inlineElements.js";
import { getLinkBlock } from "../linkTypes.js";
import { RichTextList } from "../RichTextList.js";

const inlineStyleRenderers: Renderers["inline"] = {
    BOLD: renderBoldText,
    ITALIC: renderItalicText,
    SUB: renderSubscriptText,
    SUP: renderSuperscriptText,
    STRIKETHROUGH: renderStrikethroughText,
};

function renderWithLineBreaks(node: ReactNode): ReactNode {
    if (typeof node === "string" && node.includes("\n")) {
        const lines = node.split("\n");

        return lines.flatMap((line, index) => (index === 0 ? [line] : [<br key={index} />, line]));
    }

    if (Array.isArray(node)) {
        return node.map((child) => renderWithLineBreaks(child));
    }

    return node;
}

interface CreateBlockRenderFnOptions {
    blockTextComponent: ComponentType<BlockTextProps>;
    blockTypeProps: BlockTypeTextProps;
    lastBlockKey: string;
}

function createTextBlockRenderFn({ blockTextComponent: BlockText, blockTypeProps, lastBlockKey }: CreateBlockRenderFnOptions): TextBlockRenderFn {
    return (children, { keys }) =>
        children.map((child, index) => (
            <BlockText key={keys[index]} bottomSpacing={keys[index] !== lastBlockKey} {...blockTypeProps}>
                {renderWithLineBreaks(child)}
            </BlockText>
        ));
}

function createListBlockRenderFn({
    ordered,
    blockTextComponent: BlockText,
    blockTypeProps,
    lastBlockKey,
}: CreateBlockRenderFnOptions & { ordered: boolean }): TextBlockRenderFn {
    return (children, { keys, depth }) => {
        const items = children.map((child, index) => ({ key: keys[index], content: renderWithLineBreaks(child) }));
        const key = keys.join("-");

        // MJML does not process the content of an ending tag, so a text component inside another one stays in the compiled mail as a
        // literal `mj-text` tag.
        const isInsideTextComponent = depth > 0;

        if (isInsideTextComponent) {
            return <RichTextList key={key} depth={depth} ordered={ordered} items={items} />;
        }

        return (
            <BlockText
                key={key}
                bottomSpacing={false} // The list holds this space itself — applying it here too would double it.
                {...blockTypeProps}
            >
                <RichTextList
                    ordered={ordered}
                    variant={blockTypeProps.variant}
                    bottomSpacing={!keys.includes(lastBlockKey)}
                    depth={depth}
                    items={items}
                />
            </BlockText>
        );
    };
}

const builtInListKinds: Record<string, RichTextListKind> = {
    "unordered-list-item": "unordered",
    "ordered-list-item": "ordered",
};

interface CreateRichTextRenderersOptions {
    blockTypes: Record<string, RichTextBlockTypeProps>;
    linkTypes: Record<string, RichTextLinkHrefResolver>;
    inline: Record<string, RichTextInlineRenderer>;
    blockTextComponent: ComponentType<BlockTextProps>;
    lastBlockKey: string;
}

export function createRichTextRenderers({
    blockTypes,
    linkTypes,
    inline,
    blockTextComponent,
    lastBlockKey,
}: CreateRichTextRenderersOptions): Renderers {
    const blocks: Renderers["blocks"] = {};

    // "unstyled" is redraft's blockFallback: registering it makes every block type the caller did not configure render with base theme styles.
    for (const blockType of new Set(["unstyled", ...Object.keys(builtInListKinds), ...Object.keys(blockTypes)])) {
        // `list` selects the renderer; the text component must not receive it.
        const { list, ...blockTypeProps } = blockTypes[blockType] ?? {};
        const listKind = list ?? builtInListKinds[blockType];

        blocks[blockType] =
            listKind === undefined
                ? createTextBlockRenderFn({ blockTextComponent, blockTypeProps, lastBlockKey })
                : createListBlockRenderFn({ ordered: listKind === "ordered", blockTextComponent, blockTypeProps, lastBlockKey });
    }

    return {
        inline: { ...inlineStyleRenderers, ...inline },
        blocks,
        entities: {
            LINK: (children, data, { key }) => {
                const linkBlock = getLinkBlock(data);

                if (linkBlock === undefined) {
                    return children;
                }

                const href = linkTypes[linkBlock.type]?.(linkBlock.props);

                if (href === undefined) {
                    return children;
                }

                return (
                    <HtmlInlineLink key={key} className="richTextBlock__link" href={href}>
                        {children}
                    </HtmlInlineLink>
                );
            },
        },
    };
}
