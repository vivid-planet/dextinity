import type { AiModeTool } from "./AiModeToolsets";
import {
    asBlockEditOperations,
    createBlockEditOperationsSchema,
    describeBlockEditBatch,
    describeBlockEditResults,
    describeBlockSchemaLookup,
} from "./blockEditTool";
import type { EditBlocks } from "./planBlockEdits";

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
    editBlocks,
}: {
    pageState: AiModePageState;
    getDocumentSummary: () => Record<string, unknown>;
    editBlocks: EditBlocks;
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
    {
        name: "edit_blocks",
        description:
            `Change the content of the page currently open in the editor: insert, update, remove, move, hide, and show its content blocks. ` +
            `Use this tool whenever the user asks for anything in the page's content to be written, changed, or rearranged — e.g. to write or rewrite a text, shorten, translate, or correct it, change a headline, button, link, or image, add or remove a section, or reorder blocks. ` +
            `Make the change with this tool rather than writing the new text into the chat or telling the user how to make it by hand. The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. ` +
            `The changes are applied as unsaved changes, exactly as if the user had made them by hand, so the user sees them in the editor, and saves or discards them. ` +
            `A request about 'this text' is about the text in the context's 'selection': change only that part of the block's text and keep the rest. ` +
            `Typical flow: get_page_state for the keys and types of the blocks, get_block_schema for the fields of the blocks to change (see below), then one edit_blocks call; afterwards, tell the user briefly what was changed and that the page still has to be saved. ${describeBlockEditBatch(
                { stateToolName: "get_page_state" },
            )}The page's content is the 'PageContent' block. ${describeBlockSchemaLookup({
                schemaRootBlockName: "PageContent",
                stateToolName: "get_page_state",
            })}: 'media' is the 'StandaloneMedia' block rather than the 'Media' block that also exists, 'richtext' is the 'StandaloneRichText' block rather than the 'RichText' block, 'heading' is the 'StandaloneHeading' block rather than the 'Heading' block, and 'image' is the 'DamImage' block. ` +
            `Only the page's top-level content blocks can be edited, not the stage or the SEO settings; passing the key of a nested block says so.`,
        inputSchema: {
            type: "object",
            properties: {
                operations: createBlockEditOperationsSchema({ stateToolName: "get_page_state" }),
            },
            required: ["operations"],
        },
        // The chat runs a tool without asking only if it is read-only, so the user approves every edit.
        readOnlyHint: false,
        handler: async (args, { clearTextSelection }) => {
            const { results } = await editBlocks({ operations: asBlockEditOperations(args.operations, { stateToolName: "get_page_state" }) });
            const { changes, ...result } = describeBlockEditResults({ results, unsavedIn: "the page's content" });

            if (changes > 0) {
                // The selection is the text before the change. The user selects again to ask about the new text.
                clearTextSelection();
            }

            return result;
        },
    },
];
