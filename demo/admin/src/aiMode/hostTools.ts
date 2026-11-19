import { categoryToUrlParam, pageTreeCategories } from "@src/pageTree/pageTreeCategories";

import type { AiModeTool } from "./AiModeToolsets";
import { asBlockEditOperations, type EditBlocks, isBlockEditChange } from "./editBlocks";

const categories = pageTreeCategories.map(({ category }) => category);

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createPageTreeTools = ({
    navigate,
    scopeUrl,
}: {
    navigate: (path: string) => void;
    /** The URL prefix of the current content scope, e.g. "/main/en". */
    scopeUrl: string;
}): AiModeTool[] => [
    {
        name: "open_page_tree_node",
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
        // Navigating changes no data, so the chat runs it without asking; see "Approval" in the README.
        readOnlyHint: true,
        handler: (args) => {
            const id = String(args.id ?? "");
            if (!uuidPattern.test(id)) {
                throw new Error(`open_page_tree_node requires the ID of a page tree node, a UUID, but got "${id}".`);
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
            "Change the content of the page currently open in the editor: insert, update, remove, move, hide, and show its content blocks. " +
            "Use this tool whenever the user asks for anything in the page's content to be written, changed, or rearranged — e.g. to write or rewrite a text, shorten, translate, or correct it, change a headline, button, link, or image, add or remove a section, or reorder blocks. " +
            "Make the change with this tool rather than writing the new text into the chat or telling the user how to make it by hand. The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. " +
            "The changes are applied as unsaved changes, exactly as if the user had made them by hand, so the user sees them in the editor, and saves or discards them. " +
            "A request about 'this text' is about the text in the context's 'selection': change only that part of the block's text and keep the rest. " +
            "Typical flow: get_page_state for the keys and types of the blocks, get_block_schema for the fields of the blocks to change (see below), then one edit_blocks call; afterwards, tell the user briefly what was changed and that the page still has to be saved. " +
            "Pass every change a request needs as one batch. The operations are applied in the order given, each one seeing the content as the preceding ones left it, and they either all apply or none do: an operation that fails — an unknown block type, a key that does not resolve, props that do not fit — leaves the page untouched and says what was wrong, so nothing is left half-changed. " +
            "Blocks are addressed by the 'key' get_page_state reports for them; a block inserted by the batch cannot be addressed by a later operation in it, because its key is generated on insertion. " +
            "The page's content is the 'PageContent' block, so start there to find out what to pass: call get_block_schema for 'PageContent', follow its inputFields -> blocks -> props mapping to get the block name for the type you want — the type get_page_state reports, for a block already on the page — then call get_block_schema for that name for the fields to put in 'props'. " +
            "Do not guess a block's name from its type — resolve it through that mapping, because the two differ, and a name that exists is not proof that it is the right one: 'media' is the 'StandaloneMedia' block rather than the 'Media' block that also exists, 'richtext' is the 'StandaloneRichText' block rather than the 'RichText' block, 'heading' is the 'StandaloneHeading' block rather than the 'Heading' block, and 'image' is the 'DamImage' block. " +
            "Only the page's top-level content blocks can be edited, not the stage or the SEO settings; passing the key of a nested block says so.",
        inputSchema: {
            type: "object",
            properties: {
                operations: {
                    type: "array",
                    description: "The changes to apply, in the order they should be applied.",
                    items: {
                        type: "object",
                        properties: {
                            operation: {
                                type: "string",
                                enum: ["insert", "update", "remove", "move", "show", "hide"],
                                description:
                                    "The change to make: 'insert' adds a block, 'update' changes the content of one, 'remove' takes one out, 'move' reorders one, 'show' and 'hide' decide whether one is rendered on the site. A hidden block stays on the page with its content intact.",
                            },
                            type: {
                                type: "string",
                                description:
                                    "insert: the block type to insert, e.g. 'heading' or 'richtext'. Pass an unknown value to list the insertable types.",
                            },
                            key: {
                                type: "string",
                                description: "update, remove, move, show, hide: the key of the block to change, as reported by get_page_state.",
                            },
                            props: {
                                type: "object",
                                description:
                                    "insert, update: the block's fields, in the shape the block is saved in ('inputFields'), per the schema resolved through PageContent's props mapping. On an update, fields that are left out keep their current value, nested fields included, so only what should change has to be passed; a list, however, is passed whole and replaces the current one.",
                            },
                            index: {
                                type: "number",
                                description:
                                    "insert: the position among the existing blocks (0 inserts at the top), appended at the end when omitted. move: the position the block should end up at, counted in the resulting order, so 0 moves it to the top and the number of the last position moves it to the bottom; required for a move.",
                            },
                        },
                        required: ["operation"],
                        // "anyOf" rather than "oneOf" because that is the keyword tool schemas
                        // support, and "operation" makes the branches mutually exclusive anyway.
                        // edit_blocks checks the same requirements itself: a tool schema is guidance
                        // to the agent, not something enforced before the handler runs.
                        anyOf: [
                            { properties: { operation: { const: "insert" } }, required: ["operation", "type", "props"] },
                            { properties: { operation: { const: "update" } }, required: ["operation", "key", "props"] },
                            { properties: { operation: { const: "remove" } }, required: ["operation", "key"] },
                            { properties: { operation: { const: "move" } }, required: ["operation", "key", "index"] },
                            { properties: { operation: { const: "show" } }, required: ["operation", "key"] },
                            { properties: { operation: { const: "hide" } }, required: ["operation", "key"] },
                        ],
                    },
                },
            },
            required: ["operations"],
        },
        // The chat runs a tool without asking only if it is read-only, so the user approves every edit.
        readOnlyHint: false,
        handler: async (args, { clearTextSelection }) => {
            const { results } = await editBlocks({ operations: asBlockEditOperations(args.operations) });
            const changes = results.filter(isBlockEditChange).length;

            if (changes === 0) {
                return { message: "Nothing changed: every block is already in the state it was asked to be put in.", results };
            }

            // The selection is the text before the change. The user selects again to ask about the new text.
            clearTextSelection();

            return {
                message: `Applied ${changes} ${changes === 1 ? "change" : "changes"} to the page's content. The ${changes === 1 ? "change is" : "changes are"} unsaved — the user has to save the page.`,
                results,
            };
        },
    },
];
