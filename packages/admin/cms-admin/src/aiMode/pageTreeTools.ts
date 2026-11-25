import type { AiModeTool } from "./AiModeToolsets";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The tools that open a node of the page tree, for the admin's toolset on every page, so that the agent opens a page's editor in one step. */
export const createPageTreeNavigationTools = ({
    categories,
    getEditPath,
    navigate,
}: {
    /** The categories of the page tree, e.g. "mainNavigation". */
    categories: string[];
    /** The path of the editor of a page tree node, e.g. "/main/en/pages/pagetree/main-navigation/<id>/edit". */
    getEditPath: (node: { id: string; category: string }) => string;
    navigate: (path: string) => void;
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
        // Navigating changes no data, so the chat runs it without asking.
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

            const path = getEditPath({ id, category });
            navigate(path);
            // A page with unsaved changes asks the user before it is left, and the user may decide to stay.
            return `Asked the editor to open the page at ${path}. If the page that was open has unsaved changes, the user first decides whether to discard them and may stay on it, so check with get_page_state ("pageTreeNodeId") which page is open before you refer to it.`;
        },
    },
];
