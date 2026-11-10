import type { TableBlockState } from "../../createTableBlock";
import { isPreviewContentTextRule, type PreviewContent } from "../../types";

const maximumPreviewTextLength = 100;

export function getPlainTexts(previewContents: PreviewContent[]): string[] {
    return previewContents.flatMap((previewContent) =>
        isPreviewContentTextRule(previewContent) && typeof previewContent.content === "string" ? [previewContent.content] : [],
    );
}

function getCellValuesRowByRow<CellState>({ rows, columns }: TableBlockState<CellState>): CellState[] {
    return rows.flatMap((row) =>
        columns.flatMap((column) => row.cellValues.filter((cellValue) => cellValue.columnId === column.id).map((cellValue) => cellValue.value)),
    );
}

export function createTablePreviewText<CellState>(state: TableBlockState<CellState>, getCellTexts: (cellState: CellState) => string[]): string {
    return getCellValuesRowByRow(state)
        .flatMap(getCellTexts)
        .filter((text) => text.length > 0)
        .join(", ")
        .slice(0, maximumPreviewTextLength);
}
