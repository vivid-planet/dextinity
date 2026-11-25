import type { AiModeTool } from "./AiModeToolsets";
import { type AiModeEditableBlocksBlock, createAiModeEditBlocksTool } from "./blockEditTool";

export type AiModePageTreeDocumentState = {
    pageTreeNodeId: string;
    documentType: string;
    documentId: string;
    path?: string;
    activeTab?: string;
    selectedBlockRoute?: string;
    hasChanges: boolean;
};

export type AiModePageTreeDocumentEditableBlocks = AiModeEditableBlocksBlock & {
    /** The key of the root block whose blocks are edited, e.g. "content". */
    rootBlockKey: string;
    schemaNameExamples?: string;
    restrictions?: string;
};

export const createPageTreeDocumentTools = ({
    state,
    getDocumentSummary,
    editableBlocks,
}: {
    state: AiModePageTreeDocumentState;
    getDocumentSummary: () => Record<string, unknown>;
    editableBlocks?: AiModePageTreeDocumentEditableBlocks;
}): AiModeTool[] => {
    const tools: AiModeTool[] = [
        {
            name: "get_page_state",
            description: `Get the live state of the page currently open in the editor: per root block (e.g. content, stage, SEO) the block structure, text contents, and referenced files, links, and videos, plus the SEO settings. Use this whenever the user asks about the page they are editing — unlike get_page, it includes unsaved changes.${
                editableBlocks ? " To change the content, pass the keys it reports to edit_blocks." : ""
            } The text the user has selected in the admin is in the context as 'selection', not here: when the user refers to 'this text', 'the selection', or similar, they mean it. If a block is open ('selectedBlockRoute' in the page's context), the selection is usually in that block.`,
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => ({ ...state, document: getDocumentSummary() }),
        },
    ];

    if (editableBlocks) {
        const { rootBlockKey, ...blocksBlock } = editableBlocks;
        tools.push(
            createAiModeEditBlocksTool({
                ...blocksBlock,
                name: "edit_blocks",
                description:
                    `Change the ${rootBlockKey} of the page currently open in the editor: insert, update, remove, move, hide, and show its blocks. ` +
                    `Use this tool whenever the user asks for anything in the page's ${rootBlockKey} to be written, changed, or rearranged — e.g. to write or rewrite a text, shorten, translate, or correct it, change a headline, button, link, or image, add or remove a section, or reorder blocks.`,
                contentName: `the page's ${rootBlockKey}`,
                stateToolName: "get_page_state",
                restrictions:
                    blocksBlock.restrictions ??
                    `Only the top-level blocks of the '${rootBlockKey}' root block can be edited, not the other root blocks; passing the key of a nested block says so.`,
            }),
        );
    }

    return tools;
};
