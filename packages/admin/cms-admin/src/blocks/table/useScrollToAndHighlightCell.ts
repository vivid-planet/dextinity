import {
    type GridApi,
    gridClasses,
    gridDimensionsSelector,
    gridExpandedSortedRowIdsSelector,
    gridPageSizeSelector,
    type GridRowId,
    gridRowsMetaSelector,
    gridVisibleRowsSelector,
} from "@mui/x-data-grid";
import { type RefObject, useEffect } from "react";

import type { CellPosition } from "./utils/cellRoute";

type Options = {
    apiRef: RefObject<GridApi | null>;
    cell: CellPosition | undefined;
    highlightCell: (cell: CellPosition) => void;
};

const isRowOnCurrentPage = (apiRef: RefObject<GridApi | null>, rowId: GridRowId) => gridVisibleRowsSelector(apiRef).rowIdToIndexMap.has(rowId);

const getPageOfRow = (apiRef: RefObject<GridApi | null>, rowId: GridRowId) => {
    const rowIndexInTable = gridExpandedSortedRowIdsSelector(apiRef).indexOf(rowId);
    return Math.floor(rowIndexInTable / gridPageSizeSelector(apiRef));
};

export const useScrollToAndHighlightCell = ({ apiRef, cell, highlightCell }: Options) => {
    useEffect(() => {
        const api = apiRef.current;
        const scroller = api?.rootElementRef.current?.querySelector(`.${gridClasses.virtualScroller}`);
        if (!cell || !api || !scroller) {
            return;
        }

        const column = api.getColumn(cell.columnId);
        if (!api.getRow(cell.rowId) || !column) {
            return;
        }

        if (!isRowOnCurrentPage(apiRef, cell.rowId)) {
            api.setPage(getPageOfRow(apiRef, cell.rowId));
        }

        const rowIndex = api.getRowIndexRelativeToVisibleRows(cell.rowId);

        const { viewportInnerSize, leftPinnedWidth, rightPinnedWidth } = gridDimensionsSelector(apiRef);
        const { positions: rowTops, currentPageTotalHeight } = gridRowsMetaSelector(apiRef);
        const rowBottom = rowTops[rowIndex + 1] ?? currentPageTotalHeight;
        const visibleColumnsWidth = viewportInnerSize.width - leftPinnedWidth - rightPinnedWidth;
        const cellCenterX = api.getColumnPosition(cell.columnId) + column.computedWidth / 2;
        const cellCenterY = (rowTops[rowIndex] + rowBottom) / 2;

        scroller.scrollTo({
            left: cellCenterX - leftPinnedWidth - visibleColumnsWidth / 2,
            top: cellCenterY - viewportInnerSize.height / 2,
            behavior: "smooth",
        });
        highlightCell(cell);
    }, [apiRef, cell, highlightCell]);
};
