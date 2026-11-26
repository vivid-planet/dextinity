import type { AiModeTool } from "./AiModeToolsets";
import { asBlockProps, type BlockListName } from "./blockProps";
import { asBlockEditOperations, type EditBlocks, isBlockEditChange } from "./editBlocks";

export type AiModePageState = {
    pageTreeNodeId: string;
    documentType: string;
    documentId?: string;
    path: string;
    activeTab?: string;
    selectedBlockRoute?: string;
    hasChanges: boolean;
};

export type UpdateSeo = (request: {
    /** The fields to change, in the shape the SEO block is saved in; the ones left out keep their value. */
    props: Record<string, unknown>;
}) => Promise<{ warnings: string[] }>;

/** The stage is a list block, so its items are all of this block, and an insertion needs no type. */
export const stageItemType = "BasicStage";

const blockListNames: readonly BlockListName[] = ["content", "stage"];

function asBlockListName(value: unknown): BlockListName {
    if (value === undefined) {
        return "content";
    }
    const blockListName = blockListNames.find((candidate) => candidate === value);
    if (!blockListName) {
        throw new Error(`"target" must be one of: ${blockListNames.join(", ")}. The SEO settings are changed with update_seo.`);
    }
    return blockListName;
}

export const createPageTools = ({
    pageState,
    getDocumentSummary,
    editBlocks,
    updateSeo,
}: {
    pageState: AiModePageState;
    getDocumentSummary: () => Record<string, unknown>;
    editBlocks: EditBlocks;
    updateSeo: UpdateSeo;
}): AiModeTool[] => [
    {
        name: "get_page_state",
        description:
            "Get the live state of the page currently open in the editor: per root block (content, stage, SEO) the block structure, text contents, and referenced files, links, and videos, plus the SEO settings. Use this whenever the user asks about the page they are editing — unlike get_page, it includes unsaved changes. To change the content or the stage, pass the keys it reports to edit_blocks; to change the SEO settings, use update_seo. " +
            "The text the user has selected in the admin is in the context as 'selection', not here: when the user refers to 'this text', 'the selection', or similar, they mean it. If a block is open ('selectedBlockRoute' in the page's context), the selection is usually in that block.",
        inputSchema: { type: "object", properties: {} },
        readOnlyHint: true,
        handler: () => ({ ...pageState, document: getDocumentSummary() }),
    },
    {
        name: "edit_blocks",
        description:
            "Change the content or the stage of the page currently open in the editor: insert, update, remove, move, hide, and show its blocks. " +
            "Use this tool whenever the user asks for anything in the page's content or stage to be written, changed, or rearranged — e.g. to write or rewrite a text, shorten, translate, or correct it, change a headline, button, link, or image, add or remove a section, or reorder blocks. " +
            "Make the change with this tool rather than writing the new text into the chat or telling the user how to make it by hand. The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. " +
            "The changes are applied as unsaved changes, exactly as if the user had made them by hand, so the user sees them in the editor, and saves or discards them. " +
            "A request about 'this text' is about the text in the context's 'selection': change only that part of the block's text and keep the rest. " +
            "Typical flow: get_page_state for the keys and types of the blocks, get_block_schema for the fields of the blocks to change (see below), then one edit_blocks call; afterwards, tell the user briefly what was changed and that the page still has to be saved. " +
            "Pass every change a request needs as one batch. The operations are applied in the order given, each one seeing the content as the preceding ones left it, and they either all apply or none do: an operation that fails — an unknown block type, a key that does not resolve, props that do not fit — leaves the page untouched and says what was wrong, so nothing is left half-changed. " +
            "Blocks are addressed by the 'key' get_page_state reports for them; a block inserted by the batch cannot be addressed by a later operation in it, because its key is generated on insertion. " +
            "The page's content is the 'PageContent' block, so start there to find out what to pass: call get_block_schema for 'PageContent', follow its inputFields -> blocks -> props mapping to get the block name for the type you want — the type get_page_state reports, for a block already on the page — then call get_block_schema for that name for the fields to put in 'props'. " +
            "Do not guess a block's name from its type — resolve it through that mapping, because the two differ, and a name that exists is not proof that it is the right one: 'media' is the 'StandaloneMedia' block rather than the 'Media' block that also exists, 'richtext' is the 'StandaloneRichText' block rather than the 'RichText' block, 'heading' is the 'StandaloneHeading' block rather than the 'Heading' block, and 'image' is the 'DamImage' block. " +
            "A call acts on the content unless 'target' says 'stage'. The stage is a list of 'BasicStage' blocks of which only one is visible at a time: an inserted stage needs no 'type', is inserted hidden while another one is visible, and takes the fields get_block_schema returns for 'BasicStage'; to switch the visible stage, hide the visible one before showing another in the same batch. " +
            "Only the top-level blocks of the content and the stage can be edited, not the blocks nested inside them; passing the key of a nested block says so. The SEO settings are changed with update_seo.",
        inputSchema: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    enum: blockListNames,
                    description: "The part of the page the operations act on: 'content' (the default) for the content blocks, 'stage' for the stage.",
                },
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
                                    "insert: the block type to insert, e.g. 'heading' or 'richtext'. Pass an unknown value to list the insertable types. Not needed for the stage.",
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
                            { properties: { operation: { const: "insert" } }, required: ["operation", "props"] },
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
            const target = asBlockListName(args.target);
            const { results } = await editBlocks({
                target,
                operations: asBlockEditOperations(args.operations, { defaultInsertType: target === "stage" ? stageItemType : undefined }),
            });
            const changes = results.filter(isBlockEditChange).length;

            if (changes === 0) {
                return { message: "Nothing changed: every block is already in the state it was asked to be put in.", results };
            }

            // The selection is the text before the change. The user selects again to ask about the new text.
            clearTextSelection();

            return {
                message: `Applied ${changes} ${changes === 1 ? "change" : "changes"} to the page's ${target}. The ${changes === 1 ? "change is" : "changes are"} unsaved — the user has to save the page.`,
                results,
            };
        },
    },
    {
        name: "update_seo",
        description:
            "Change the SEO settings of the page currently open in the editor, e.g. its HTML title, meta description, Open Graph title, description, and image, canonical URL, structured data, sitemap settings, or alternative links. " +
            "Use this tool whenever the user asks for any of them to be written or changed, e.g. to improve the meta description, and make the change with it rather than writing the new text into the chat. The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. " +
            "get_page_state reports the current settings under 'seo', and get_block_schema for 'Seo' the fields. Pass only the fields to change, in the shape the 'Seo' block is saved in ('inputFields'): fields that are left out keep their current value, nested fields included; a list, however, is passed whole and replaces the current one. " +
            "The change is applied as an unsaved change, exactly as if the user had made it by hand; afterwards, tell the user briefly what was changed and that the page still has to be saved.",
        inputSchema: {
            type: "object",
            properties: {
                props: {
                    type: "object",
                    description: "The fields of the 'Seo' block to change, in the shape it is saved in.",
                },
            },
            required: ["props"],
        },
        readOnlyHint: false,
        handler: async (args, { clearTextSelection }) => {
            const { warnings } = await updateSeo({ props: asBlockProps(args.props) });

            // The selection may be the text the change replaced, as for edit_blocks.
            clearTextSelection();

            return {
                message: "Applied the change to the page's SEO settings. The change is unsaved — the user has to save the page.",
                ...(warnings.length > 0 ? { warnings } : {}),
            };
        },
    },
];
