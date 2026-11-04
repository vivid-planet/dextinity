import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { type TableCellProps } from "@mui/material/TableCell";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { Component, createRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";

import type { ISelectionApi } from "../SelectionApi";
import type { IExportApi } from "./excelexport/IExportApi";
import { isVisible } from "./isVisible";
import { TablePagination } from "./Pagination";
import type { IPagingInfo } from "./paging/IPagingInfo";
import { safeColumnGet } from "./safeColumnGet";
import { TableBodyRow, type TableBodyRowProps } from "./TableBodyRow";
import { type ISortApi, SortDirection } from "./useTableQuerySort";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type ITableHeadRowProps<TRow extends IRow> = ITableHeadColumnsProps<TRow>;
function DefaultHeadTableRow<TRow extends IRow>({ columns, sortApi }: ITableHeadRowProps<TRow>) {
    return (
        <TableRow>
            <TableHeadColumns columns={columns} sortApi={sortApi} />
        </TableRow>
    );
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface ITableHeadColumnsProps<TRow extends IRow> {
    columns: Array<ITableColumn<TRow>>;
    sortApi?: ISortApi;
}
// render default TableCell fragments for given columns
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function TableHeadColumns<TRow extends IRow>({ columns, sortApi }: ITableHeadColumnsProps<TRow>) {
    const handleSortClick = (name: string, ev: MouseEvent) => {
        if (sortApi) {
            sortApi.changeSort(name);
        }
    };

    return (
        <>
            {columns.map((column: any, colIndex: number) => {
                if (!isVisible(VisibleType.Browser, column.visible)) {
                    return null;
                }
                const { name, header, sortable, headerProps } = column;
                return (
                    <TableCell key={colIndex} {...headerProps}>
                        {sortable ? (
                            <TableSortLabel
                                active={sortApi && sortApi.current.columnName === name}
                                direction={sortApi && sortApi.current.direction === SortDirection.DESC ? "desc" : "asc"}
                                onClick={handleSortClick.bind(null, name)}
                            >
                                {header}
                            </TableSortLabel>
                        ) : (
                            header
                        )}
                    </TableCell>
                );
            })}
        </>
    );
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface ITableColumnsProps<TRow extends IRow> {
    row: TRow;
    columns: Array<ITableColumn<TRow>>;
}
// render default TableCell fragments for given columns
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function TableColumns<TRow extends IRow>({ row, columns }: ITableColumnsProps<TRow>) {
    return (
        <>
            {columns.map((column: any, colIndex: number) => {
                if (!isVisible(VisibleType.Browser, column.visible)) {
                    return null;
                }
                return (
                    <TableCell key={colIndex} {...column.cellProps}>
                        {column.render ? column.render(row) : safeColumnGet(row, column.name)}
                    </TableCell>
                );
            })}
        </>
    );
}
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IRow {
    id: string | number;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export enum VisibleType {
    Browser = "browser",
    Export = "export",
}
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type Visible = boolean | { [key in VisibleType]?: boolean };
/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface ITableColumn<TRow extends IRow> {
    name: string;
    visible?: Visible;
    header?: ReactNode;
    headerExcel?: string;
    render?: (row: TRow) => ReactNode;
    renderExcel?: (row: TRow) => string | number;
    formatForExcel?: string;
    sortable?: boolean;
    cellProps?: TableCellProps;
    headerProps?: TableCellProps;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface ITableRowProps<TRow extends IRow> extends ITableColumnsProps<TRow> {
    index: number;
    key: any;
    rowProps: TableBodyRowProps;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface ITableProps<TRow extends IRow> {
    data: TRow[];
    totalCount: number;
    selectedId?: string;
    selectable?: boolean;
    page?: number;
    renderTableRow?: (props: ITableRowProps<TRow>) => ReactNode;
    renderHeadTableRow?: (props: ITableHeadRowProps<TRow>) => ReactNode;
    selectionApi?: ISelectionApi;
    pagingInfo?: IPagingInfo;
    rowName?: string | ((count: number) => string);
    hideTableHead?: boolean;
    columns: Array<ITableColumn<TRow>>;
    sortApi?: ISortApi;
    paginationPosition?: "bottom" | "top" | "both";
    exportApis?: Array<IExportApi<TRow>>;
    className?: string;
}

function DefaultTableRow<TRow extends IRow>({ columns, row, rowProps }: ITableRowProps<TRow>) {
    return (
        <TableBodyRow {...rowProps}>
            <TableColumns columns={columns} row={row} />
        </TableBodyRow>
    );
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export class Table<TRow extends IRow> extends Component<ITableProps<TRow>> {
    private domRef: RefObject<HTMLTableElement | null>;
    constructor(props: ITableProps<TRow>) {
        super(props);
        this.domRef = createRef<HTMLTableElement>();
    }

    public render() {
        const { data, exportApis = [] } = this.props;

        const renderHeadTableRow = this.props.renderHeadTableRow || ((props) => <DefaultHeadTableRow {...props} />);

        if (this.props.pagingInfo) {
            this.props.pagingInfo.attachTableRef(this.domRef);
        }
        exportApis.forEach((exportApi) => {
            exportApi.attachTable(this);
        });

        const paginationPosition = this.props.paginationPosition || "bottom";
        const shouldRenderTopPagination = paginationPosition === "top" || paginationPosition === "both";
        const shouldRenderBottomPagination = paginationPosition === "bottom" || paginationPosition === "both";

        return (
            <MuiTable ref={this.domRef} className={this.props.className}>
                {!this.props.hideTableHead && (
                    <TableHead>
                        {this.props.pagingInfo && shouldRenderTopPagination && (
                            <TableRow>
                                <TablePagination totalCount={this.props.totalCount} pagingInfo={this.props.pagingInfo} rowName={this.props.rowName} />
                            </TableRow>
                        )}
                        {renderHeadTableRow({
                            columns: this.props.columns,
                            sortApi: this.props.sortApi,
                        })}
                    </TableHead>
                )}
                <TableBody>
                    {data.map((row, index) => {
                        const isSelected = this.isSelected(row.id);
                        const renderTableRow = this.props.renderTableRow || ((props) => <DefaultTableRow {...props} />);
                        return renderTableRow({
                            index,
                            row,
                            columns: this.props.columns,
                            key: row.id,
                            rowProps: {
                                hover: this.props.selectable,
                                onClick: this.handleClick.bind(this, row.id),
                                role: "checkbox",
                                tabIndex: -1,
                                selected: isSelected,
                                onKeyDown: this.handleKeyDown,
                                index,
                                hideTableHead: !!this.props.hideTableHead,
                            },
                        });
                    })}
                </TableBody>
                {this.props.pagingInfo && shouldRenderBottomPagination && (
                    <TableFooter>
                        <TableRow>
                            <TablePagination totalCount={this.props.totalCount} pagingInfo={this.props.pagingInfo} rowName={this.props.rowName} />
                        </TableRow>
                    </TableFooter>
                )}
            </MuiTable>
        );
    }

    private handleClick = (id: string, event: MouseEvent) => {
        if (this.props.selectable && this.props.selectionApi) {
            this.props.selectionApi.handleSelectId(id);
        }
    };

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (this.props.selectable && this.props.selectionApi) {
                const selectedIndex = this.props.data.findIndex((i) => String(this.props.selectedId) === String(i.id));
                if (selectedIndex !== -1) {
                    const nextSelectedIndex = event.key === "ArrowDown" ? selectedIndex + 1 : selectedIndex - 1;
                    if (this.props.data[nextSelectedIndex]) {
                        this.props.selectionApi.handleSelectId(String(this.props.data[nextSelectedIndex].id));
                    }
                }
                event.preventDefault();
            }
        }
    };

    private isSelected(id: string | number) {
        return String(this.props.selectedId) === String(id); //  as strings as selectedId might come from url
    }
}
