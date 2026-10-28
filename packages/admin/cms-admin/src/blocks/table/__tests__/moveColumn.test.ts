import { cleanup } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { mockStates } from "../__mocks__/TableBlockData.mocks";
import { clickButtonOfColumnAtIndex, getCellValuesPerColumn, openColumnOptionsAtIndex, renderTableBlock } from "./utils";

describe("TableBlock: Move a column", () => {
    it("should swap a column with the column to the right when moving it right", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const [firstColumnBefore, secondColumnBefore, ...otherColumnsBefore] = getCellValuesPerColumn(rendered);

        clickButtonOfColumnAtIndex(rendered, 0, /move right/i);

        expect(getCellValuesPerColumn(rendered)).toEqual([secondColumnBefore, firstColumnBefore, ...otherColumnsBefore]);
    });

    it("should swap a column with the column to the left when moving it left", async () => {
        const rendered = renderTableBlock(mockStates.default);
        const [firstColumnBefore, secondColumnBefore, ...otherColumnsBefore] = getCellValuesPerColumn(rendered);

        clickButtonOfColumnAtIndex(rendered, 1, /move left/i);

        expect(getCellValuesPerColumn(rendered)).toEqual([secondColumnBefore, firstColumnBefore, ...otherColumnsBefore]);
    });

    it('should disable "Move left" for the first column', async () => {
        const rendered = renderTableBlock(mockStates.default);

        openColumnOptionsAtIndex(rendered, 0);

        expect(rendered.getByRole("menuitem", { name: /move left/i }).getAttribute("aria-disabled")).toBe("true");
    });

    it('should disable "Move right" for the last column', async () => {
        const rendered = renderTableBlock(mockStates.default);
        const lastColumnIndex = mockStates.default.columns.length - 1;

        openColumnOptionsAtIndex(rendered, lastColumnIndex);

        expect(rendered.getByRole("menuitem", { name: /move right/i }).getAttribute("aria-disabled")).toBe("true");
    });
});
