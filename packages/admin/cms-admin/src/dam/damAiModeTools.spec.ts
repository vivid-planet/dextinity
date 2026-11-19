import { describe, expect, it, vi } from "vitest";

import type { AiModeTool } from "../aiMode/AiModeToolsets";
import { createDamTools, type DamAiModeItem } from "./damAiModeTools";

const items: DamAiModeItem[] = [
    { __typename: "DamFolder", id: "f1", name: "Products", numberOfFiles: 3, numberOfChildFolders: 1 },
    { __typename: "DamFile", id: "1", name: "cap.jpg", mimetype: "image/jpeg", archived: false, fileUrl: "https://example.com/cap.jpg" },
];

function createTools({ isLoading = false, search = "", page = 2 }: { isLoading?: boolean; search?: string; page?: number } = {}) {
    const callbacks = { setSearch: vi.fn(), setPage: vi.fn(), openFolder: vi.fn(), openFile: vi.fn() };
    const tools = createDamTools({
        folder: { id: "f0", name: "Shop", parents: [{ name: "Marketing" }] },
        items,
        totalCount: 2,
        isLoading,
        search,
        page,
        pageSize: 20,
        ...callbacks,
    });
    const call = (name: string, args: Record<string, unknown> = {}) => findTool(tools, name).handler(args, { clearTextSelection: vi.fn() });
    return { ...callbacks, call };
}

function findTool(tools: AiModeTool[], name: string) {
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No tool "${name}"`);
    }
    return tool;
}

it("runs every tool without the user's approval, because none changes data", () => {
    const tools = createDamTools({
        folder: null,
        items,
        isLoading: false,
        search: "",
        page: 0,
        pageSize: 20,
        setSearch: vi.fn(),
        setPage: vi.fn(),
        openFolder: vi.fn(),
        openFile: vi.fn(),
    });

    expect(tools.every(({ readOnlyHint }) => readOnlyHint === true)).toBe(true);
});

describe("get_dam_items", () => {
    it("returns the folder with its path, and its folders and files", () => {
        const { call } = createTools();

        expect(call("get_dam_items")).toEqual({
            folder: { id: "f0", name: "Shop", path: "Marketing / Shop" },
            items: [
                { kind: "folder", id: "f1", name: "Products", numberOfFiles: 3, numberOfChildFolders: 1 },
                { kind: "file", id: "1", name: "cap.jpg", mimetype: "image/jpeg", archived: false, fileUrl: "https://example.com/cap.jpg" },
            ],
            totalCount: 2,
            search: "",
            page: 2,
            pageSize: 20,
        });
    });

    it("says that the items are still loading rather than returning those of the previous view", () => {
        const { call } = createTools({ isLoading: true });

        expect(call("get_dam_items")).toMatch(/still loading/);
    });
});

describe("set_dam_view", () => {
    it("searches and goes back to the first page", () => {
        const { call, setSearch, setPage } = createTools();

        call("set_dam_view", { search: "cap" });

        expect(setSearch).toHaveBeenCalledWith("cap");
        expect(setPage).toHaveBeenCalledWith(0);
    });

    it("keeps the page when the search stays the same", () => {
        const { call, setSearch, setPage } = createTools({ search: "cap" });

        call("set_dam_view", { search: "cap" });

        expect(setSearch).not.toHaveBeenCalled();
        expect(setPage).not.toHaveBeenCalled();
    });

    it("refuses a page that isn't a page number", () => {
        const { call, setPage } = createTools();

        expect(() => call("set_dam_view", { page: 1.5 })).toThrow('"page" must be a page number');
        expect(setPage).not.toHaveBeenCalled();
    });
});

describe("open_dam_folder and open_dam_file", () => {
    it("open a folder in the grid and the form of a file", () => {
        const { call, openFolder, openFile } = createTools();

        call("open_dam_folder", { id: "f1" });
        call("open_dam_file", { id: "1" });

        expect(openFolder).toHaveBeenCalledWith("f1");
        expect(openFile).toHaveBeenCalledWith("1");
    });

    it("require an ID", () => {
        const { call } = createTools();

        expect(() => call("open_dam_folder", {})).toThrow('requires "id"');
        expect(() => call("open_dam_file", {})).toThrow('requires "id"');
    });
});
