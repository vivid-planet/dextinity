import { type OperationVariables, useApolloClient } from "@apollo/client";
import { useState } from "react";

import type { Table } from "../Table";
import type { ITableQueryApi } from "../TableQueryContext";
import { createExcelExportDownload, type IExcelExportOptions } from "./createExcelExportDownload";
import type { IExportApi } from "./IExportApi";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function useExportTableQuery<IVariables extends OperationVariables>(
    api: ITableQueryApi,
    variables: IVariables,
    options?: IExcelExportOptions,
): IExportApi<any> {
    let tableRef: Table<any> | undefined;
    const [loading, setLoading] = useState(false);
    function attachTable(ref: Table<any>) {
        tableRef = ref;
    }

    const client = useApolloClient();

    async function exportTable() {
        if (tableRef != null) {
            setLoading(true);
            try {
                const query = api.getQuery();
                const innerOptions = api.getInnerOptions();

                const response = await client.query<any, IVariables>({
                    query,
                    ...innerOptions,
                    variables: { ...variables },
                });

                const data = api.resolveTableData(response.data);

                if (data && data.data) {
                    await createExcelExportDownload<any>(tableRef.props.columns, data.data, options);
                }
            } catch {
                throw new Error("Error happend while exporting data");
            } finally {
                setLoading(false);
            }
        }
    }

    return {
        loading,
        exportTable,
        attachTable,
    };
}
