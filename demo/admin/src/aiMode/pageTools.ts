import { type AiModeEditableBlocksBlock, type AiModeTool, createAiModeEditBlocksTool } from "@dextinity/cms-admin";

export type AiModePageState = {
    pageTreeNodeId: string;
    documentType: string;
    documentId?: string;
    path: string;
    activeTab?: string;
    selectedBlockRoute?: string;
    hasChanges: boolean;
};

export const createPageTools = ({
    pageState,
    getDocumentSummary,
    contentBlocks,
}: {
    pageState: AiModePageState;
    getDocumentSummary: () => Record<string, unknown>;
    /** The blocks of the page's `PageContent` block. */
    contentBlocks: Omit<AiModeEditableBlocksBlock, "schemaBlockName">;
}): AiModeTool[] => [
    {
        name: "get_page_state",
        description:
            "Get the live state of the page currently open in the editor: per root block (content, stage, SEO) the block structure, text contents, and referenced files, links, and videos, plus the SEO settings. Use this whenever the user asks about the page they are editing — unlike get_page, it includes unsaved changes. To change the content, pass the keys it reports to edit_blocks. " +
            "The text the user has selected in the admin is in the context as 'selection', not here: when the user refers to 'this text', 'the selection', or similar, they mean it. If a block is open ('selectedBlockRoute' in the page's context), the selection is usually in that block.",
        inputSchema: { type: "object", properties: {} },
        readOnlyHint: true,
        handler: () => ({ ...pageState, document: getDocumentSummary() }),
    },
    createAiModeEditBlocksTool({
        ...contentBlocks,
        name: "edit_blocks",
        description:
            "Change the content of the page currently open in the editor: insert, update, remove, move, hide, and show its content blocks. " +
            "Use this tool whenever the user asks for anything in the page's content to be written, changed, or rearranged — e.g. to write or rewrite a text, shorten, translate, or correct it, change a headline, button, link, or image, add or remove a section, or reorder blocks.",
        contentName: "the page's content",
        stateToolName: "get_page_state",
        // PageContentBlock's name in block-meta, where the agent resolves the block schemas.
        schemaBlockName: "PageContent",
        schemaNameExamples:
            "'media' is the 'StandaloneMedia' block rather than the 'Media' block that also exists, 'richtext' is the 'StandaloneRichText' block rather than the 'RichText' block, 'heading' is the 'StandaloneHeading' block rather than the 'Heading' block, and 'image' is the 'DamImage' block",
        restrictions:
            "Only the page's top-level content blocks can be edited, not the stage or the SEO settings; passing the key of a nested block says so.",
    }),
];
