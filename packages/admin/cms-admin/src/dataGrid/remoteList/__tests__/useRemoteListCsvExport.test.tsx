import type { DataGridColumn } from "@dextinity/ui";
import { act, renderHook } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { useRemoteListCsvExport } from "../useRemoteListCsvExport";

const downloadDataGridCsv = vi.hoisted(() => vi.fn());

vi.mock("@dextinity/ui", () => ({ downloadDataGridCsv }));

interface Row {
    id: number;
}

const columns: DataGridColumn<Row>[] = [{ key: "id", header: "ID" }];

describe("useRemoteListCsvExport", () => {
    it("loads all pages before exporting", async () => {
        const allRows = Array.from({ length: 5 }, (_, index) => ({ id: index }));
        const fetchPage = vi.fn(async ({ offset, limit }: { offset: number; limit: number }) => ({
            nodes: allRows.slice(offset, offset + limit),
            totalCount: allRows.length,
        }));
        const { result } = renderHook(() => useRemoteListCsvExport({ fetchPage, columns, fileName: "rows.csv", batchSize: 2 }));

        await act(() => result.current.exportCsv());

        expect(fetchPage).toHaveBeenCalledTimes(3);
        expect(downloadDataGridCsv).toHaveBeenCalledWith("rows.csv", expect.objectContaining({ rows: allRows, columns }));
        expect(result.current.exporting).toBe(false);
    });
});
