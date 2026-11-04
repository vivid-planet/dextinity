import type { IRow, Table } from "../Table";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IExportApi<TRow extends IRow> {
    loading: boolean;
    progress?: number;
    exportTable: () => void;
    attachTable: (ref: Table<TRow>) => void;
}
