import type { AiModeTool } from "../aiMode/AiModeToolsets";

type DamFolderItem = { __typename: "DamFolder"; id: string; name: string; numberOfFiles: number; numberOfChildFolders: number };
type DamFileItem = { __typename: "DamFile"; id: string; name: string; mimetype: string; archived: boolean; fileUrl: string };

/** An item of the DAM grid, as its query returns it. Only the fields the agent reads are listed. */
export type DamAiModeItem = DamFolderItem | DamFileItem;

export type DamAiModeFolder = { id: string; name: string; parents: Array<{ name: string }> };

function summarizeItem(item: DamAiModeItem) {
    if (item.__typename === "DamFolder") {
        return { kind: "folder", id: item.id, name: item.name, numberOfFiles: item.numberOfFiles, numberOfChildFolders: item.numberOfChildFolders };
    }
    return { kind: "file", id: item.id, name: item.name, mimetype: item.mimetype, archived: item.archived, fileUrl: item.fileUrl };
}

/**
 * The tools of the DAM's grid: `get_dam_items`, `set_dam_view`, `open_dam_folder`, and `open_dam_file`. They read and
 * change what the grid shows. The MCP server's `list_dam_files` and `get_dam_file` search the whole DAM instead.
 */
export function createDamTools({
    folder,
    items,
    totalCount,
    isLoading,
    search,
    page,
    pageSize,
    setSearch,
    setPage,
    openFolder,
    openFile,
}: {
    /** The folder the grid shows, or null at the top level of the DAM. */
    folder: DamAiModeFolder | null;
    items: DamAiModeItem[];
    totalCount?: number;
    isLoading: boolean;
    search: string;
    page: number;
    pageSize: number;
    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    openFolder: (id: string) => void;
    openFile: (id: string) => void;
}): AiModeTool[] {
    return [
        {
            name: "get_dam_items",
            description:
                "Get what the DAM grid open in the admin shows: the folder it is in, and the folders and files of the current page, with the total number of items, the search, and the page. " +
                "To search or page, use set_dam_view; to open a folder or a file, use open_dam_folder or open_dam_file. To find files anywhere in the DAM, use list_dam_files instead.",
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => {
                if (isLoading) {
                    return "The DAM grid is still loading its items. Read them again in a moment.";
                }
                return {
                    folder: folder
                        ? { id: folder.id, name: folder.name, path: [...folder.parents.map(({ name }) => name), folder.name].join(" / ") }
                        : null,
                    items: items.map(summarizeItem),
                    totalCount,
                    search,
                    page,
                    pageSize,
                };
            },
        },
        {
            name: "set_dam_view",
            description:
                "Change what the DAM grid open in the admin shows: its search or its page. An argument that is left out stays as it is; a new search goes back to the first page. Afterwards, read the items with get_dam_items.",
            inputSchema: {
                type: "object",
                properties: {
                    search: { type: "string", description: "The text to search for in the names of files and folders; an empty string clears it." },
                    page: { type: "number", description: "The page to show, counted from 0." },
                },
            },
            // Navigating and changing the view change no data, so the chat runs them without asking.
            readOnlyHint: true,
            handler: (args) => {
                const newSearch = args.search === undefined ? undefined : String(args.search);
                const requestedPage = args.page === undefined ? undefined : Number(args.page);
                if (requestedPage !== undefined && (!Number.isInteger(requestedPage) || requestedPage < 0)) {
                    throw new Error(`"page" must be a page number counted from 0, but is ${String(args.page)}.`);
                }

                if (newSearch !== undefined && newSearch !== search) {
                    setSearch(newSearch);
                }
                const newPage = requestedPage ?? (newSearch !== undefined && newSearch !== search ? 0 : undefined);
                if (newPage !== undefined && newPage !== page) {
                    setPage(newPage);
                }

                return "Changed the view of the DAM grid. Read the items it shows now with get_dam_items.";
            },
        },
        {
            name: "open_dam_folder",
            description:
                "Open a folder of the DAM in the grid, e.g. one that get_dam_items or list_dam_files reports. To go back to the top level of the DAM, open the DAM page with open_admin_page.",
            inputSchema: {
                type: "object",
                properties: { id: { type: "string", description: "The ID of the folder." } },
                required: ["id"],
            },
            // Navigating and changing the view change no data, so the chat runs them without asking.
            readOnlyHint: true,
            handler: (args) => {
                const id = String(args.id ?? "");
                if (id === "") {
                    throw new Error('open_dam_folder requires "id", the ID of a folder.');
                }
                openFolder(id);
                return "Opened the folder. Read what it contains with get_dam_items.";
            },
        },
        {
            name: "open_dam_file",
            description:
                "Open the form of a file of the DAM, e.g. one that get_dam_items or list_dam_files reports, where its title and alternative text are edited. Once it is open, the form offers its own tools to read and fill it in.",
            inputSchema: {
                type: "object",
                properties: { id: { type: "string", description: "The ID of the file." } },
                required: ["id"],
            },
            // Navigating and changing the view change no data, so the chat runs them without asking.
            readOnlyHint: true,
            handler: (args) => {
                const id = String(args.id ?? "");
                if (id === "") {
                    throw new Error('open_dam_file requires "id", the ID of a file.');
                }
                openFile(id);
                return "Opened the form of the file.";
            },
        },
    ];
}
