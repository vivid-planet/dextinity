import type { GridValidRowModel } from "@mui/x-data-grid";
import * as Excel from "exceljs";

import type { GridColDef } from "../GridColDef";
import { applyDefaultStyling } from "./applyDefaultStyling";

export interface ExcelGenerationOptions {
    worksheetName: string;
    styling?: (worksheet: Excel.Worksheet) => void;
}

function resolveSingleSelectValueOptionLabel<Row extends GridValidRowModel>(column: GridColDef<Row>, row: Row, value: unknown) {
    if (column.type !== "singleSelect" || column.valueOptions == null) {
        return value;
    }

    const valueOptions =
        typeof column.valueOptions === "function" ? column.valueOptions({ field: column.field, id: row.id, row }) : column.valueOptions;
    const matchingValueOption = valueOptions.find((valueOption) => {
        if (typeof valueOption === "object") {
            return valueOption.value === value;
        }

        return valueOption === value;
    });

    if (matchingValueOption == null || typeof matchingValueOption !== "object") {
        return matchingValueOption ?? value;
    }

    return matchingValueOption.label;
}

export function generateExcelFile<Row extends GridValidRowModel>(
    columns: Array<GridColDef<Row>>,
    data: Row[],
    generateOptions: ExcelGenerationOptions,
) {
    const { worksheetName, styling } = generateOptions;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    const excelColumns: Partial<Excel.Column>[] = [];

    columns.forEach((column, columnIndex) => {
        const header = column.headerName;
        if (!column.disableExport) {
            excelColumns.push({
                header,
                key: column.field + columnIndex,
                width: 20,
                outlineLevel: 0,
                style: {},
                letter: columnIndex.toString(),
                values: [],
            });
        }
    });

    worksheet.columns = excelColumns;

    for (const row of data) {
        const excelRow: { [key: string]: string | number | null } = {};

        try {
            columns.forEach((column, columnIndex) => {
                if (!column.disableExport) {
                    let value = row[column.field];
                    if (column.valueGetter) {
                        // @ts-expect-error `valueGetter` requires more data but we don't have all that data available so we only pass in what we have and hope nothing breaks
                        value = column.valueGetter(value, row) ?? "";
                    }
                    if (column.valueFormatter) {
                        // @ts-expect-error `valueFormatter` requires more data but we don't have all that data available so we only pass in what we have and hope nothing breaks
                        value = column.valueFormatter(value, row) ?? "";
                    } else {
                        value = resolveSingleSelectValueOptionLabel(column, row, value);
                    }

                    if (
                        typeof value !== "string" &&
                        typeof value !== "boolean" &&
                        typeof value !== "number" &&
                        value !== null &&
                        !(value instanceof Date)
                    ) {
                        throw new Error(`The type of the provided value "${typeof value}" is not supported for excel export.`);
                    }

                    excelRow[column.field + columnIndex] = value;
                }
            });

            worksheet.addRow(excelRow);
        } catch (e) {
            throw new Error(e);
        }
    }

    if (styling != null) {
        styling(worksheet);
    } else {
        applyDefaultStyling(worksheet);
    }

    return workbook;
}
