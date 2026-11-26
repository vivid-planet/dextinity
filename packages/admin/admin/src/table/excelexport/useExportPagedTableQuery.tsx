import { type OperationVariables, useApolloClient } from "@apollo/client";
import { useState } from "react";

import type { Table } from "../Table";
import type { ITableQueryApi } from "../TableQueryContext";
import { createExcelExportDownload, type IExcelExportOptions } from "./createExcelExportDownload";
import type { IExportApi } from "./IExportApi";

interface IOptions<IVariables> {
    variablesForPage: (page: number) => IVariables;
    fromPage?: number;
    toPage?: number;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function useExportPagedTableQuery<IVariables extends OperationVariables>(
    api: ITableQueryApi,
    options: IOptions<IVariables>,
    excelOptions?: IExcelExportOptions,
): IExportApi<any> {
    let tableRef: Table<any> | undefined;
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    function attachTable(ref: Table<any>) {
        tableRef = ref;
    }

    const client = useApolloClient();

    async function exportTable() {
        if (tableRef != null) {
            setProgress(0);
            setLoading(true);

            const { fromPage = 1, toPage = 1 } = options;

            try {
                const exportData: any[] = [];

                for (let i = fromPage; i <= toPage; ++i) {
                    const query = api.getQuery();
                    const innerOptions = api.getInnerOptions();

                    const variables = options.variablesForPage(i);
                    const response = await client.query<any, IVariables>({
                        query,
                        ...innerOptions,
                        variables: { ...variables },
                    });

                    const data = api.resolveTableData(response.data);

                    if (data && data.data) {
                        exportData.push(...data.data);
                    }
                    const progressInPercent = (i / (toPage - fromPage)) * 100;
                    setProgress(progressInPercent);
                }
                await createExcelExportDownload<any>(tableRef.props.columns, exportData, excelOptions);
            } catch {
                throw new Error("Error happend while exporting data");
            } finally {
                setLoading(false);
            }
        }
    }

    return {
        loading,
        progress,
        exportTable,
        attachTable,
    };
}
