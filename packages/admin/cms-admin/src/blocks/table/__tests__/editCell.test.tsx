import { cleanup, fireEvent, waitFor, within } from "test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { getBodyRowgroup, getCellsExcludingTheDragHandleAndActionsCells, renderTableBlock } from "./utils";

beforeAll(() => {
    // jsdom doesn't implement scrolling
    Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

const getFirstCell = (rendered: ReturnType<typeof renderTableBlock>) => {
    const [firstRow] = within(getBodyRowgroup(rendered)).getAllByRole("row");
    return getCellsExcludingTheDragHandleAndActionsCells(firstRow)[0];
};

describe("TableBlock: Edit a cell", () => {
    it("should open the rich text editor of a cell with Enter and close it with Done", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const cell = getFirstCell(rendered);
        const cellText = cell.textContent;

        fireEvent.keyDown(cell, { key: "Enter" });
        const editor = await rendered.findByRole("dialog", { name: "Column 1" });
        expect(within(editor).getByText(cellText ?? "")).toBeTruthy();

        fireEvent.click(within(editor).getByRole("button", { name: "Done" }));

        await waitFor(() => expect(rendered.queryByRole("dialog", { name: "Column 1" })).toBeNull());
        expect(getFirstCell(rendered).textContent).toBe(cellText);
    });

    it("should keep editing when Enter is pressed in the editor, and stop on Escape", async () => {
        const rendered = renderTableBlock(mockStates.default);

        fireEvent.keyDown(getFirstCell(rendered), { key: "Enter" });
        const editor = await rendered.findByRole("dialog", { name: "Column 1" });
        const editable = editor.querySelector<HTMLElement>('[contenteditable="true"]');
        if (!editable) {
            throw new Error("The cell editor has no editable text");
        }

        fireEvent.keyDown(editable, { key: "Enter" });
        expect(rendered.queryByRole("dialog", { name: "Column 1" })).not.toBeNull();

        fireEvent.keyDown(editable, { key: "Escape" });
        await waitFor(() => expect(rendered.queryByRole("dialog", { name: "Column 1" })).toBeNull());
    });
});
