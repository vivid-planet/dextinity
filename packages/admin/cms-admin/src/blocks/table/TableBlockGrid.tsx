import { DragIndicator } from "@dextinity/admin-icons";
/* eslint-disable no-restricted-imports */
import {
    DataGrid as MuiDataGrid,
    type DataGridProps,
    type GridColDef,
    type GridColumnHeaderParams,
    type GridEventListener,
    type GridRenderCellParams,
    type GridRenderEditCellParams,
    type GridValidRowModel,
} from "@mui/x-data-grid";
/* eslint-enable no-restricted-imports */
import type { DataGridProProps, GridApiPro } from "@mui/x-data-grid-pro";
import { type ComponentType, type Dispatch, type SetStateAction, useCallback, useEffect, useRef } from "react";

import type { TableBlockData } from "../../blocks.generated";
import { type DextinityConfig, useDextinityConfig } from "../../config/DextinityConfigContext";
import type { TableBlockState } from "../createTableBlock";
import { CellValue } from "./CellValue";
import { ColumnHeader } from "./ColumnHeader";
import { dataGridStyles, freeDataGridStyles, lastContentColumnClassName } from "./dataGridStyles";
import { EditCell } from "./EditCell";
import { RowActionsCell } from "./RowActionsCell";
import { useTableBlockContext } from "./TableBlockContext";
import { useScrollToAndHighlightCell } from "./useScrollToAndHighlightCell";
import { type CellPosition, createCellKey } from "./utils/cellRoute";
import { moveColumnToIndex } from "./utils/column";
import { ensureMinimumTableState } from "./utils/ensureMinimumTableState";
import { moveRowToIndex } from "./utils/row";
import { useTemporarilyHighlightedIds } from "./utils/useTemporarilyHighlightedIds";

type ColumnSize = TableBlockData["columns"][number]["size"];
type TableBlockColumn = TableBlockData["columns"][number];

type ConfiguredDataGrid = NonNullable<DextinityConfig["dataGrid"]>["component"];

const reorderColumnField = "__reorder__";
const maximumPageSizeOfFreeDataGrid = 100;

const isProOrPremiumDataGrid = (dataGrid: ConfiguredDataGrid): dataGrid is ComponentType<DataGridProProps> =>
    dataGrid !== undefined && dataGrid !== MuiDataGrid;

const getLastContentColumnClassName = (columnIndex: number, numberOfColumns: number) =>
    columnIndex === numberOfColumns - 1 ? lastContentColumnClassName : undefined;

const widthForColumnSize: Record<ColumnSize, number> = {
    extraSmall: 100,
    small: 200,
    standard: 300,
    large: 400,
    extraLarge: 500,
};

const flexForColumnSize: Record<ColumnSize, number> = {
    extraSmall: 1,
    small: 2,
    standard: 3,
    large: 4,
    extraLarge: 5,
};

type Props = {
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    clickedCell?: CellPosition;
};

export const TableBlockGrid = ({ state, updateState, clickedCell }: Props) => {
    const { RichTextBlock } = useTableBlockContext();
    const { dataGrid: { component: ConfiguredDataGrid } = {} } = useDextinityConfig();
    const hasDragAndDrop = isProOrPremiumDataGrid(ConfiguredDataGrid);
    const apiRef = useRef<GridApiPro | null>(null);
    const { highlightedIds: recentlyPastedRowIds, highlightTemporarily: addToRecentlyPastedRowIds } = useTemporarilyHighlightedIds();
    const { highlightedIds: recentlyPastedColumnIds, highlightTemporarily: addToRecentlyPastedColumnIds } = useTemporarilyHighlightedIds();
    const { highlightedIds: recentlyClickedCellKeys, highlightTemporarily: highlightCellKey } = useTemporarilyHighlightedIds();

    const highlightCell = useCallback((cell: CellPosition) => highlightCellKey(createCellKey(cell)), [highlightCellKey]);
    useScrollToAndHighlightCell({ apiRef, cell: clickedCell, highlightCell });

    useEffect(() => {
        if (state.columns.length === 0 || state.rows.length === 0) {
            updateState((prevState) => ensureMinimumTableState(prevState, RichTextBlock));
        }
    }, [state.columns.length, state.rows.length, updateState, RichTextBlock]);

    const setRowData: Dispatch<SetStateAction<TableBlockState["rows"]>> = (newRows) => {
        updateState((state) => {
            return { ...state, rows: typeof newRows === "function" ? newRows(state.rows) : newRows };
        });
    };

    const processRowUpdate: DataGridProps["processRowUpdate"] = (newRow) => {
        const { id: newRowId, ...newRowValuesRecord } = newRow;

        setRowData((previousRowData) => {
            return previousRowData.map((existingRow) => {
                if (existingRow.id === newRowId) {
                    return {
                        ...existingRow,
                        cellValues: Object.entries(newRowValuesRecord).map(([columnId, value]) => ({
                            columnId,
                            value,
                        })),
                    };
                }
                return existingRow;
            });
        });

        return newRow;
    };

    useEffect(() => {
        const handleMoveColumn: GridEventListener<"columnHeaderDragEnd"> = ({ field: columnId }) => {
            if (!apiRef.current) {
                return;
            }
            const targetIndex = apiRef.current.getColumnIndex(columnId) - 1;

            updateState((state) => moveColumnToIndex({ state, columnId, targetIndex }));
        };

        return apiRef.current?.subscribeEvent("columnHeaderDragEnd", handleMoveColumn);
    }, [apiRef, updateState]);

    const dataGridColumns: GridColDef[] = [
        ...state.columns.map(({ id: columnId, highlighted, size }: TableBlockColumn, index: number) => ({
            field: columnId,
            editable: true,
            sortable: false,
            flex: flexForColumnSize[size],
            minWidth: widthForColumnSize[size],
            headerClassName: getLastContentColumnClassName(index, state.columns.length),
            cellClassName: getLastContentColumnClassName(index, state.columns.length),
            renderHeader: (params: GridColumnHeaderParams) => (
                <ColumnHeader
                    {...params}
                    state={state}
                    columnSize={size}
                    highlighted={highlighted}
                    updateState={updateState}
                    columnIndex={index}
                    isDraggable={hasDragAndDrop}
                    addToRecentlyPastedIds={addToRecentlyPastedColumnIds}
                />
            ),
            renderCell: ({ value, row, field: columnId }: GridRenderCellParams) => {
                const rowFromState = state.rows.find((rowInState) => rowInState.id === row.id);
                const rowWasRecentlyPasted = recentlyPastedRowIds.includes(row.id);
                const columnWasRecentlyPasted = recentlyPastedColumnIds.includes(columnId);
                const cellWasRecentlyClicked = recentlyClickedCellKeys.includes(createCellKey({ columnId, rowId: row.id }));

                return (
                    <CellValue
                        value={value}
                        highlighted={rowFromState?.highlighted || highlighted}
                        isTemporarilyHighlighted={rowWasRecentlyPasted || columnWasRecentlyPasted || cellWasRecentlyClicked}
                    />
                );
            },
            renderEditCell: (params: GridRenderEditCellParams) => {
                return <EditCell {...params} />;
            },
        })),
        {
            field: "actions",
            sortable: false,
            headerName: "",
            minWidth: 36,
            maxWidth: 36,
            disableReorder: true,
            renderCell: ({ row }) => (
                <RowActionsCell row={row} updateState={updateState} state={state} addToRecentlyPastedIds={addToRecentlyPastedRowIds} />
            ),
        },
    ];

    const rowsInDataGridFormat = state.rows.map(({ id, cellValues }) => {
        const dataGridRow: GridValidRowModel = { id };
        cellValues.forEach(({ columnId, value }) => {
            dataGridRow[columnId] = value;
        });
        return dataGridRow;
    });

    const commonDataGridProps = {
        apiRef,
        rows: rowsInDataGridFormat,
        rowHeight: 55,
        disableColumnResize: true,
        disableColumnMenu: true,
        disableRowSelectionOnClick: true,
        processRowUpdate,
    } satisfies Partial<DataGridProps>;

    if (isProOrPremiumDataGrid(ConfiguredDataGrid)) {
        return (
            <ConfiguredDataGrid
                {...commonDataGridProps}
                sx={dataGridStyles}
                columns={[{ field: reorderColumnField, minWidth: 36, maxWidth: 36 }, ...dataGridColumns]}
                rowReordering
                hideFooter
                pinnedColumns={{
                    left: [reorderColumnField],
                    right: ["actions"],
                }}
                slots={{
                    rowReorderIcon: ({ color, ...restProps }) => <DragIndicator {...restProps} htmlColor={color} />,
                }}
                onRowOrderChange={({ targetIndex, row }) => {
                    updateState((state) => moveRowToIndex({ state, rowId: row.id, targetIndex }));
                }}
            />
        );
    }

    return (
        <MuiDataGrid
            {...commonDataGridProps}
            sx={freeDataGridStyles}
            disableVirtualization
            pageSizeOptions={[maximumPageSizeOfFreeDataGrid]}
            columns={dataGridColumns}
            hideFooter={state.rows.length <= maximumPageSizeOfFreeDataGrid}
        />
    );
};
