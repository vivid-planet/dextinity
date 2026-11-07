import { type DataGridColumn, type DataGridColumnVisibility, downloadDataGridCsv } from "@dextinity/ui";
import { useCallback, useState } from "react";

interface RemoteListPage<Row> {
    nodes: Row[];
    totalCount: number;
}

export interface UseRemoteListCsvExportOptions<Row> {
    /** Loads one page of the rows to export, with the filters and sort of the list. */
    fetchPage: (page: { offset: number; limit: number }) => Promise<RemoteListPage<Row>>;
    columns: DataGridColumn<Row>[];
    columnVisibility?: DataGridColumnVisibility;
    /** The name of the downloaded file, e.g. `news.csv`. */
    fileName: string;
    /** @defaultValue `100` */
    batchSize?: number;
    /** @defaultValue `","` */
    separator?: string;
}

/**
 * Exports all rows of a remote list as CSV, not only the shown page, by loading them page by page.
 */
export function useRemoteListCsvExport<Row>({
    fetchPage,
    columns,
    columnVisibility,
    fileName,
    batchSize = 100,
    separator,
}: UseRemoteListCsvExportOptions<Row>): { exportCsv: () => Promise<void>; exporting: boolean } {
    const [exporting, setExporting] = useState(false);

    const exportCsv = useCallback(async () => {
        setExporting(true);
        try {
            const rows: Row[] = [];
            let totalCount = Infinity;
            while (rows.length < totalCount) {
                const page = await fetchPage({ offset: rows.length, limit: batchSize });
                rows.push(...page.nodes);
                totalCount = page.totalCount;
                if (page.nodes.length === 0) {
                    break;
                }
            }
            downloadDataGridCsv(fileName, { columns, rows, columnVisibility, separator });
        } finally {
            setExporting(false);
        }
    }, [fetchPage, batchSize, fileName, columns, columnVisibility, separator]);

    return { exportCsv, exporting };
}
