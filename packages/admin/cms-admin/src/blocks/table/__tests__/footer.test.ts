import { DataGrid } from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { cleanup } from "test-utils";
import { v4 as uuid } from "uuid";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import type { TableBlockState } from "../../createTableBlock";
import { createRteState } from "../__mocks__/TableBlockData.mocks";
import { renderTableBlock } from "./utils";

const createStateWithRows = (numberOfRows: number): TableBlockState => {
    const columnId = uuid();
    return {
        columns: [{ id: columnId, size: "standard", highlighted: false }],
        rows: Array.from({ length: numberOfRows }, (_, index) => ({
            id: uuid(),
            highlighted: false,
            cellValues: [{ columnId, value: createRteState(`Row ${index + 1}`) }],
        })),
    };
};

describe("TableBlock: Footer", () => {
    it("should paginate a table with more than 100 rows, because the free data grid shows at most 100 rows per page", async () => {
        const rendered = renderTableBlock(createStateWithRows(101), { component: DataGrid });

        expect(rendered.queryByText(/of 101/)).not.toBeNull();
    });

    it("should not offer a page size select, because a page size below 100 would hide rows once the footer hides", async () => {
        const rendered = renderTableBlock(createStateWithRows(101), { component: DataGrid });

        expect(rendered.queryByText(/rows per page/i)).toBeNull();
    });

    it("should hide the pagination of a table with 100 rows, because they fit on one page", async () => {
        const rendered = renderTableBlock(createStateWithRows(100), { component: DataGrid });

        expect(rendered.queryByText(/of 100/)).toBeNull();
    });

    it("should hide the footer with the Pro data grid, which doesn't paginate", async () => {
        const rendered = renderTableBlock(createStateWithRows(101), { component: DataGridPro });

        expect(rendered.queryByText(/total rows/i)).toBeNull();
    });
});
