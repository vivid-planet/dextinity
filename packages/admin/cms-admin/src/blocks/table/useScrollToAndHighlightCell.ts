import { type GridApiPro, gridClasses, gridDimensionsSelector, gridRowsMetaSelector } from "@mui/x-data-grid-pro";
import { type RefObject, useEffect } from "react";

import type { CellPosition } from "./utils/cellRoute";

type Options = {
    apiRef: RefObject<GridApiPro | null>;
    cell: CellPosition | undefined;
    highlightCell: (cell: CellPosition) => void;
};

export const useScrollToAndHighlightCell = ({ apiRef, cell, highlightCell }: Options) => {
    useEffect(() => {
        const api = apiRef.current;
        const scroller = api?.rootElementRef.current?.querySelector(`.${gridClasses.virtualScroller}`);
        if (!cell || !api || !scroller) {
            return;
        }

        const rowIndex = api.getRowIndexRelativeToVisibleRows(cell.rowId);
        const column = api.getColumn(cell.columnId);
        if (rowIndex === -1 || !column) {
            return;
        }

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
