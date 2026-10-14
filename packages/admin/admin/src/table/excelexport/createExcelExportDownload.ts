// TODO: Normal import: import * as Excel from "exceljs"; is currently not working due to https://github.com/exceljs/exceljs/pull/1038 as soon pull request is merged into exceljs change import and update package version
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Excel from "exceljs/dist/exceljs.js";
import type { ReactNode } from "react";

import { downloadFile } from "../../helpers/downloadFile";
import { isVisible } from "../isVisible";
import { safeColumnGet } from "../safeColumnGet";
import { type IRow, type ITableColumn, VisibleType } from "../Table";
import { applyDefaultStyling } from "./applyDefaultStyling";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IExcelExportOptions {
    fileName?: string;
    worksheetName?: string;
    styling?: (worksheet: Excel.Worksheet) => void;
}
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export async function createExcelExportDownload<TRow extends IRow>(
    columns: Array<ITableColumn<TRow>>,
    data: TRow[],
    options: IExcelExportOptions = {},
) {
    const { fileName = "ExcelExport", worksheetName = "Tabelle 1", styling } = options;
    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet(worksheetName);

    // create columns
    const excelColumns: Excel.Column[] = [];
    columns.forEach((column, columnIndex) => {
        const header = column.headerExcel != null ? column.headerExcel : safeStringFromReactNode(column.header);
        if (isVisible(VisibleType.Export, column.visible)) {
            excelColumns.push({
                header,
                key: column.name + columnIndex,
                width: 20,
                outlineLevel: 0,
                style: {},
                letter: columnIndex.toString(),
                values: [],
            });
        }
    });
    worksheet.columns = excelColumns;

    // create Rows
    {
        data.map((row) => {
            const newRow: { [key: string]: string | number | null } = {};

            columns.forEach((column, index) => {
                if (column.renderExcel) {
                    newRow[column.name + index] = column.renderExcel(row);
                } else {
                    const render = column.render != null ? safeStringFromReactNode(column.render(row)) : null;
                    newRow[column.name + index] = render != null ? render : safeColumnGet(row, column.name);
                }
            });
            worksheet.addRow({ ...newRow });
        });
    }

    // apply number format
    columns.forEach((column) => {
        try {
            const currentColumn = worksheet.getColumn(column.name);

            if (column.formatForExcel != null) {
                currentColumn.numFmt = column.formatForExcel;
            }
        } catch {
            // not present column e.g. hidden
        }
    });

    if (styling != null) {
        styling(worksheet);
    } else {
        applyDefaultStyling(worksheet);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile(new Blob([buffer]), safeFileNameWithExtension(fileName));
}

function safeFileNameWithExtension(fileName: string): string {
    const excelRegex = /^.*.xlsx?$/;
    return fileName.match(excelRegex) ? fileName : `${fileName}.xlsx`;
}

function safeStringFromReactNode(node: string | string | ReactNode): string {
    return typeof node === "string" ? node : "";
}
