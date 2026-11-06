import { type RefObject, useEffect } from "react";

import { tableCellKeyAttribute } from "./CellValue";
import { type CellPosition, createCellKey } from "./utils/cellRoute";

type Options = {
    gridRef: RefObject<HTMLElement | null>;
    cell: CellPosition | undefined;
    highlightCell: (cell: CellPosition) => void;
};

export const useScrollToAndHighlightCell = ({ gridRef, cell, highlightCell }: Options) => {
    useEffect(() => {
        if (!cell) {
            return;
        }

        // Waits for the dialog to lay out the grid
        const animationFrame = requestAnimationFrame(() => {
            const cellKey = createCellKey(cell);
            const cellElement = Array.from(gridRef.current?.querySelectorAll(`[${tableCellKeyAttribute}]`) ?? []).find(
                (element) => element.getAttribute(tableCellKeyAttribute) === cellKey,
            );
            if (!cellElement) {
                return;
            }

            cellElement.scrollIntoView({ block: "center", inline: "center" });
            highlightCell(cell);
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [gridRef, cell, highlightCell]);
};
