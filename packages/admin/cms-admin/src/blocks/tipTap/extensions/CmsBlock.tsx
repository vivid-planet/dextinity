import { Box } from "@mui/material";
import { grey as muiGreyPalette } from "@mui/material/colors";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { useContext, useState } from "react";

import { BlockPreviewContent } from "../../common/blockRow/BlockPreviewContent";
import { useBlockContext } from "../../context/useBlockContext";
import { type BlockInterface, type BlockState, isPreviewContentTextRule } from "../../types";
import { ChildBlocksContext } from "../ChildBlocksContext";
import { TipTapBlockDialog } from "../TipTapBlockDialog";

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
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {text || label}
            </Box>
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

    if (isInline) {
        return (
            <NodeViewWrapper as="span" style={{ display: "inline-block", verticalAlign: "baseline" }}>
                <Box
                    component="span"
                    contentEditable={false}
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        maxWidth: "100%",
                        px: "6px",
                        py: "1px",
                        border: `1px solid ${selected ? muiGreyPalette[600] : muiGreyPalette[300]}`,
                        borderRadius: "4px",
                        backgroundColor: muiGreyPalette[50],
                        cursor: "pointer",
                        "&:hover": { borderColor: muiGreyPalette[500] },
                    }}
                    onClick={() => {
                        if (block) {
                            setEditDialogOpen(true);
                        }
                    }}
                >
                    {block ? <InlineBlockPreview block={block} state={node.attrs.data} /> : blockType}
                </Box>
                {dialog}
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper>
            <Box
                contentEditable={false}
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: "8px 12px",
                    my: "8px",
                    border: `1px solid ${selected ? muiGreyPalette[600] : muiGreyPalette[300]}`,
                    borderRadius: "4px",
                    backgroundColor: muiGreyPalette[50],
                    cursor: "pointer",
                    "&:hover": { borderColor: muiGreyPalette[500] },
                }}
                onClick={() => {
                    if (block) {
                        setEditDialogOpen(true);
                    }
                }}
            >
                <Box sx={{ flexGrow: 1, overflow: "hidden", pointerEvents: "none" }}>
                    {block ? <BlockPreviewContent block={block} state={node.attrs.data} showIcon /> : blockType}
                </Box>
            </Box>
            {dialog}
        </NodeViewWrapper>
    );
};

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
                data: {
                    default: null,
                },
            };
        },

        parseHTML() {
            return [{ tag: inline ? "span[data-cms-block]" : "div[data-cms-block]" }];
        },

        renderHTML({ HTMLAttributes }) {
            return [inline ? "span" : "div", mergeAttributes(HTMLAttributes, { "data-cms-block": "" })];
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
