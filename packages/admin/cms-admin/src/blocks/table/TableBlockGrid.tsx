import { DataGrid, type DataGridColumn, ToastViewport, useToasts } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";

import type { TableBlockData } from "../../blocks.generated";
import type { TableBlockRowState, TableBlockState } from "../createTableBlock";
import { CellValue } from "./CellValue";
import { ColumnActionsMenu } from "./ColumnActionsMenu";
import { RichTextCellEditor } from "./RichTextCellEditor";
import { RowActionsMenu } from "./RowActionsMenu";
import { useTableBlockContext } from "./TableBlockContext";
import { useScrollToAndHighlightCell } from "./useScrollToAndHighlightCell";
import { type CellPosition, createCellKey } from "./utils/cellRoute";
import { ensureMinimumTableState } from "./utils/ensureMinimumTableState";
import { moveRowToIndex } from "./utils/row";
import { useTemporarilyHighlightedIds } from "./utils/useTemporarilyHighlightedIds";

type ColumnSize = TableBlockData["columns"][number]["size"];

const widthForColumnSize: Record<ColumnSize, number> = {
    extraSmall: 100,
    small: 200,
    standard: 300,
    large: 400,
    extraLarge: 500,
};

// The grip before and the row actions after the cells
const rowControlsWidth = 40 + 52;

/** How wide the grid of a table block is when every column gets the width of its size. */
export function getTableBlockGridWidth(columns: TableBlockState["columns"]) {
    return columns.reduce((width, column) => width + widthForColumnSize[column.size], rowControlsWidth);
}

const getCellValue = (row: TableBlockRowState, columnId: string): unknown =>
    row.cellValues.find((cellValue) => cellValue.columnId === columnId)?.value;

const setCellValue = (row: TableBlockRowState, columnId: string, value: unknown): TableBlockRowState => ({
    ...row,
    cellValues: row.cellValues.map((cellValue) => (cellValue.columnId === columnId ? { ...cellValue, value } : cellValue)),
});

type Props = {
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    clickedCell?: CellPosition;
};

export const TableBlockGrid = ({ state, updateState, clickedCell }: Props) => {
    const intl = useIntl();
    const { RichTextBlock } = useTableBlockContext();
    const gridRef = useRef<HTMLDivElement>(null);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { highlightedIds: recentlyPastedRowIds, highlightTemporarily: addToRecentlyPastedRowIds } = useTemporarilyHighlightedIds();
    const { highlightedIds: recentlyPastedColumnIds, highlightTemporarily: addToRecentlyPastedColumnIds } = useTemporarilyHighlightedIds();
    const { highlightedIds: recentlyClickedCellKeys, highlightTemporarily: highlightCellKey } = useTemporarilyHighlightedIds();

    const highlightCell = useCallback((cell: CellPosition) => highlightCellKey(createCellKey(cell)), [highlightCellKey]);
    useScrollToAndHighlightCell({ gridRef, cell: clickedCell, highlightCell });

    useEffect(() => {
        if (state.columns.length === 0 || state.rows.length === 0) {
            updateState((prevState) => ensureMinimumTableState(prevState, RichTextBlock));
        }
    }, [state.columns.length, state.rows.length, updateState, RichTextBlock]);

    const showError = (message: string) => addToast({ message, tone: "error" });

    const columns: DataGridColumn<TableBlockRowState>[] = state.columns.map(({ id: columnId, highlighted, size }, columnIndex) => ({
        key: columnId,
        header: intl.formatMessage({ id: "dextinity.tableBlock.columnHeader", defaultMessage: "Column {number}" }, { number: columnIndex + 1 }),
        width: widthForColumnSize[size],
        hideable: false,
        editable: true,
        editor: { type: "custom", render: (params) => <RichTextCellEditor {...params} /> },
        getValue: (row) => getCellValue(row, columnId),
        setValue: (row, value) => setCellValue(row, columnId, value),
        render: (row) => (
            <CellValue
                value={getCellValue(row, columnId)}
                highlighted={row.highlighted || highlighted}
                isTemporarilyHighlighted={
                    recentlyPastedRowIds.includes(row.id) ||
                    recentlyPastedColumnIds.includes(columnId) ||
                    recentlyClickedCellKeys.includes(createCellKey({ columnId, rowId: row.id }))
                }
                cellKey={createCellKey({ columnId, rowId: row.id })}
            />
        ),
        headerActions: (
            <ColumnActionsMenu
                columnId={columnId}
                columnIndex={columnIndex}
                columnSize={size}
                highlighted={highlighted}
                state={state}
                updateState={updateState}
                addToRecentlyPastedIds={addToRecentlyPastedColumnIds}
                showError={showError}
            />
        ),
    }));

    return (
        <Root>
            <Grid<TableBlockRowState>
                ref={gridRef}
                aria-label={intl.formatMessage({ id: "dextinity.blocks.table.displayName", defaultMessage: "Table" })}
                variant="plain"
                stickyHeader
                columns={columns}
                rows={state.rows}
                getRowId={(row) => row.id}
                onRowChange={(changedRow) => {
                    updateState((state) => ({ ...state, rows: state.rows.map((row) => (row.id === changedRow.id ? changedRow : row)) }));
                }}
                onRowReorder={(fromIndex, toIndex) => {
                    const movedRow = state.rows[fromIndex];
                    if (movedRow) {
                        updateState((state) => moveRowToIndex({ state, rowId: movedRow.id, targetIndex: toIndex }));
                    }
                }}
                rowActions={(row) => (
                    <RowActionsMenu
                        rowId={row.id}
                        state={state}
                        updateState={updateState}
                        addToRecentlyPastedIds={addToRecentlyPastedRowIds}
                        showError={showError}
                    />
                )}
                labels={{
                    moveRow: intl.formatMessage({ id: "dextinity.tableBlock.moveRow", defaultMessage: "Move row" }),
                    actions: intl.formatMessage({ id: "dextinity.tableBlock.rowActions", defaultMessage: "Row actions" }),
                }}
            />
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
        </Root>
    );
};

const Root = styled("div")`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-block-size: 0;
`;

// Lines between the cells, like in a spreadsheet, so empty cells stay visible. The first and the last cell of a row hold the grip and
// the row actions.
const Grid = styled(DataGrid)`
    flex: 1;

    tbody td:not(:first-of-type, :last-of-type) {
        border-block-end: var(--dextinity-line-width) solid var(--dextinity-color-line);
    }

    tbody td:not(:first-of-type, :last-of-type, :nth-last-of-type(2)),
    thead th:not(:first-of-type, :last-of-type, :nth-last-of-type(2)) {
        border-inline-end: var(--dextinity-line-width) solid var(--dextinity-color-line);
    }
` as typeof DataGrid;
