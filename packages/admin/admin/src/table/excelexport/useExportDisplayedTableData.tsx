import { useState } from "react";

import type { Table } from "../Table";
import { createExcelExportDownload, type IExcelExportOptions } from "./createExcelExportDownload";
import type { IExportApi } from "./IExportApi";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function useExportDisplayedTableData(options?: IExcelExportOptions): IExportApi<any> {
    let tableRef: Table<any> | undefined;

    const [loading, setLoading] = useState(false);
    function attachTable(ref: Table<any>) {
        tableRef = ref;
    }

    async function exportTable() {
        if (tableRef != null) {
            setLoading(true);
            try {
                await createExcelExportDownload(tableRef.props.columns, tableRef.props.data, options);
            } finally {
                setLoading(false);
            }
        } else {
            throw new Error("No table ref set");
        }
    }

    return {
        loading,
        exportTable,
        attachTable,
    };
}
