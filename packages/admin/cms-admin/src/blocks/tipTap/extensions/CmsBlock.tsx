import { styled } from "@mui/material/styles";
import { Node } from "@tiptap/core";
import { NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { useContext, useState } from "react";

import { BlockPreviewContent } from "../../common/blockRow/BlockPreviewContent";
import { useBlockContext } from "../../context/useBlockContext";
import { type BlockInterface, type BlockState, isPreviewContentTextRule } from "../../types";
import { ChildBlocksContext } from "../ChildBlocksContext";
import { TipTapBlockDialog } from "../TipTapBlockDialog";
import { createJsonDataAttribute } from "./jsonDataAttribute";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        cmsBlock: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            insertCmsBlock: (attrs: { blockType: string; data: any }) => ReturnType;
        };
        cmsInlineBlock: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            insertCmsInlineBlock: (attrs: { blockType: string; data: any }) => ReturnType;
        };
    }
}

const InlineBlockPreview = ({ block, state }: { block: BlockInterface; state: unknown }) => {
    const context = useBlockContext();
    const text = block
        .previewContent(state, context)
        .filter(isPreviewContentTextRule)
        .map((rule) => rule.content)
        .filter(Boolean)
        .join(" ");
    const icon = block.icon?.(state);
    const label = block.dynamicDisplayName?.(state) ?? block.displayName;

    return (
        <>
            {icon}
            <InlineBlockText>{text || label}</InlineBlockText>
        </>
    );
};

const CmsBlockView = ({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) => {
    const childBlocks = useContext(ChildBlocksContext);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const blockType = node.attrs.blockType as string;
    const block = childBlocks[blockType];
    const isInline = node.type.isInline;

    const dialog = editDialogOpen && block && (
        <TipTapBlockDialog
            block={block}
            initialState={node.attrs.data as BlockState<typeof block>}
            isEditing
            onSubmit={(data) => updateAttributes({ data })}
            onRemove={deleteNode}
            onClose={() => setEditDialogOpen(false)}
        />
    );

    const openEditDialog = () => {
        if (block) {
            setEditDialogOpen(true);
        }
    };

    if (isInline) {
        return (
            <NodeViewWrapper as="span">
                <InlineBlockButton type="button" contentEditable={false} data-selected={selected ? "" : undefined} onClick={openEditDialog}>
                    {block ? <InlineBlockPreview block={block} state={node.attrs.data} /> : blockType}
                </InlineBlockButton>
                {dialog}
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper>
            <BlockButton type="button" contentEditable={false} data-selected={selected ? "" : undefined} onClick={openEditDialog}>
                {block ? <BlockPreviewContent block={block} state={node.attrs.data} showIcon /> : blockType}
            </BlockButton>
            {dialog}
        </NodeViewWrapper>
    );
};

const blockButtonStyles = `
    box-sizing: border-box;
    align-items: center;
    max-inline-size: 100%;
    border: 0;
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);
    box-shadow: inset 0 0 0 var(--dextinity-line-width) var(--dextinity-color-line-strong);
    color: var(--dextinity-color-text);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: box-shadow var(--dextinity-motion-duration-short);

    &:hover {
        box-shadow: inset 0 0 0 var(--dextinity-line-width) var(--dextinity-color-control-line);
    }

    &[data-selected],
    &:focus-visible {
        outline: none;
        box-shadow: var(--dextinity-focus-ring);
    }
`;

const InlineBlockButton = styled("button")`
    ${blockButtonStyles}

    display: inline-flex;
    gap: var(--dextinity-space-1);
    padding: 1px 6px;
    vertical-align: baseline;
`;

const InlineBlockText = styled("span")`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const BlockButton = styled("button")`
    ${blockButtonStyles}

    display: flex;
    inline-size: 100%;
    margin-block: var(--dextinity-space-2);
    padding: var(--dextinity-space-2) var(--dextinity-space-3);
    overflow: hidden;

    > * {
        pointer-events: none;
    }
`;

const createCmsBlock = ({ inline }: { inline: boolean }) =>
    Node.create({
        name: inline ? "cmsInlineBlock" : "cmsBlock",
        group: inline ? "inline" : "block",
        inline,
        atom: true,
        selectable: true,
        draggable: !inline,

        addAttributes() {
            return {
                blockType: {
                    default: null,
                },
                data: createJsonDataAttribute("data-cms-block"),
            };
        },

        parseHTML() {
            return [{ tag: inline ? "span[data-cms-block]" : "div[data-cms-block]" }];
        },

        renderHTML({ HTMLAttributes }) {
            return [inline ? "span" : "div", HTMLAttributes];
        },

        addNodeView() {
            return ReactNodeViewRenderer(CmsBlockView);
        },

        addCommands() {
            const nodeName = this.name;
            const insertCommand =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (attrs: { blockType: string; data: any }) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ commands }: any) =>
                        commands.insertContent({ type: nodeName, attrs });

            return inline ? { insertCmsInlineBlock: insertCommand } : { insertCmsBlock: insertCommand };
        },
    });

export const CmsBlock = createCmsBlock({ inline: false });
export const CmsInlineBlock = createCmsBlock({ inline: true });
