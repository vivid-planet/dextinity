import {
    type AiModeTool,
    asBlockEditOperations,
    blockEditOperationsSchema,
    describeBlockEditBatch,
    describeBlockEditResults,
    describeBlockSchemaLookup,
    type EditBlocks,
} from "@dextinity/cms-admin";
import { categoryToUrlParam, pageTreeCategories } from "@src/pageTree/pageTreeCategories";

import type { AdminPage } from "./adminPages";

const categories = pageTreeCategories.map(({ category }) => category);

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createAdminTools = ({
    pages,
    navigate,
    scopeUrl,
}: {
    pages: AdminPage[];
    navigate: (path: string) => void;
    /** The URL prefix of the current content scope, e.g. "/main/en". */
    scopeUrl: string;
}): AiModeTool[] => [
    {
        name: "open_admin_page",
        description:
            "Open a page of the admin's main navigation in the current content scope, e.g. when the user asks to go to the assets or the redirects, or for something only that page offers. " +
            "Each page offers its own tools: once it is open, the context's 'scopes' list them. Unsaved changes of the page that is open are not lost silently: the user is asked whether to discard them, and may stay on it.",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: `The path of the page, one of these, each with the page's label in the navigation:\n${pages.map(({ path, label }) => `${path}: ${label}`).join("\n")}`,
                },
            },
            required: ["path"],
        },
        handler: (args) => {
            const path = String(args.path ?? "");
            const page = pages.find((candidate) => candidate.path === path);
            if (!page) {
                throw new Error(`"${path}" is no page the user can open. It must be one of: ${pages.map((candidate) => candidate.path).join(", ")}.`);
            }

            navigate(`${scopeUrl}${page.path}`);
            return `Asked the admin to open "${page.label}". If the page that was open has unsaved changes, the user first decides whether to discard them and may stay on it, so check the context's 'scopes' for which page is open before you use its tools.`;
        },
    },
];

export const createPageTreeTools = ({
    navigate,
    scopeUrl,
}: {
    navigate: (path: string) => void;
    /** The URL prefix of the current content scope, e.g. "/main/en". */
    scopeUrl: string;
}): AiModeTool[] => [
    {
        name: "open_page",
        description:
            "Open the document of a page tree node of the current content scope in the editor, e.g. a node found with list_page_tree_nodes. Unsaved changes of the page that is open are not lost silently: the user is asked whether to discard them.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "The ID of the page tree node (not the ID of its document)." },
                category: {
                    type: "string",
                    enum: categories,
                    description: "The category of the page tree node, as list_page_tree_nodes and get_page_tree_node report it.",
                },
            },
            required: ["id", "category"],
        },
        handler: (args) => {
            const id = String(args.id ?? "");
            if (!uuidPattern.test(id)) {
                throw new Error(`open_page requires the ID of a page tree node, a UUID, but got "${id}".`);
            }
            const category = String(args.category ?? "");
            if (!categories.includes(category)) {
                throw new Error(`"${category}" is no page tree category. It must be one of: ${categories.join(", ")}.`);
            }

            const path = `${scopeUrl}/pages/pagetree/${categoryToUrlParam(category)}/${id}/edit`;
            navigate(path);
            // A page with unsaved changes asks the user before it is left, and the user may decide to stay.
            return `Asked the editor to open the page at ${path}. If the page that was open has unsaved changes, the user first decides whether to discard them and may stay on it, so check with get_page_state ("pageTreeNodeId") which page is open before you refer to it.`;
        },
    },
];

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
                operations: blockEditOperationsSchema,
            },
            required: ["operations"],
        },
        // The chat runs a tool without asking only if it is read-only, so the user approves every edit.
        readOnlyHint: false,
        handler: async (args, { clearTextSelection }) => {
            const { results } = await editBlocks({ operations: asBlockEditOperations(args.operations) });
            const { changes, ...result } = describeBlockEditResults({ results, unsavedIn: "the page's content" });

            if (changes > 0) {
                // The selection is the text before the change. The user selects again to ask about the new text.
                clearTextSelection();
            }

            return result;
        },
    },
];
