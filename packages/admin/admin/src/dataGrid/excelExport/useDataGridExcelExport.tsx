import { type DocumentNode, type OperationVariables, useApolloClient } from "@apollo/client";
import type { GridValidRowModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import { downloadFile } from "../../helpers/downloadFile";
import type { GridColDef } from "../GridColDef";
import { type ExcelGenerationOptions, generateExcelFile } from "./generateExcelFile";

export interface ExportApi {
    loading: boolean;
    error?: unknown;
    exportGrid: () => void;
}

type DataGridExcelExportOptions = Omit<ExcelGenerationOptions, "worksheetName"> & {
    fileName?: string;
    worksheetName?: string;
};

export function useDataGridExcelExport<Row extends GridValidRowModel, GQLQuery, GQLQueryVariables extends OperationVariables>(params: {
    columns: Array<GridColDef<Row>>;
    variables: GQLQueryVariables;
    query: DocumentNode;
    resolveQueryNodes: (queryData: GQLQuery) => Row[];
    totalCount: number;
    exportOptions?: DataGridExcelExportOptions;
    hasPaging?: boolean;
}): ExportApi {
    const { columns, variables, query, resolveQueryNodes, totalCount, exportOptions, hasPaging = true } = params;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const client = useApolloClient();
    const intl = useIntl();

    const createExcelExportDownload = useCallback(
        async <Row extends GridValidRowModel>(columns: Array<GridColDef<Row>>, data: Row[], exportOptions: DataGridExcelExportOptions = {}) => {
            const {
                fileName = intl.formatMessage({ id: "dextinity.dataGrid.excelExport.defaultFileName", defaultMessage: "ExcelExport" }),
                worksheetName = intl.formatMessage({ id: "dextinity.dataGrid.excelExport.defaultWorksheetName", defaultMessage: "Table 1" }),
                styling,
            } = exportOptions;
            const workbook = generateExcelFile<Row>(columns, data, { worksheetName, styling });

            workbook.xlsx.writeBuffer().then((buffer) => {
                downloadFile(new Blob([buffer]), safeFileNameWithExtension(fileName));
            });
        },
        [intl],
    );

    const exportGrid = useCallback(async () => {
        setLoading(true);

        try {
            const data: Row[] = [];
            const incrementAmount = 100;
            let offset = 0;
            do {
                const { data: pageData } = await client.query<GQLQuery, GQLQueryVariables>({
                    query,
                    variables: {
                        ...variables,
                        ...(hasPaging
                            ? {
                                  offset,
                                  limit: incrementAmount,
                              }
                            : {}),
                    },
                });
                offset += incrementAmount;

                data.push(...resolveQueryNodes(pageData));
            } while (hasPaging && data.length < totalCount);

            if (data.length > 0) {
                createExcelExportDownload<Row>(columns, data, exportOptions);
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, [client, columns, createExcelExportDownload, exportOptions, query, resolveQueryNodes, totalCount, variables, hasPaging]);

    return {
        loading,
        error,
        exportGrid,
    };
}

const safeFileNameWithExtension = (fileName: string) => {
    const excelRegex = /^.*.xlsx?$/;
    return fileName.match(excelRegex) ? fileName : `${fileName}.xlsx`;
};
