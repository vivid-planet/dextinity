import type { TableBlockState } from "../../createTableBlock";
import type { BlockInterface } from "../../types";

export const ensureMinimumTableState = (state: TableBlockState, RichTextBlock: BlockInterface): TableBlockState => {
    let result = state;

    if (result.columns.length === 0) {
        const newColumnId = crypto.randomUUID();
        result = {
            ...result,
            columns: [{ id: newColumnId, size: "standard", highlighted: false }],
            rows: result.rows.map((row) => ({
                ...row,
                cellValues: [...row.cellValues, { columnId: newColumnId, value: RichTextBlock.defaultValues() }],
            })),
        };
    }

    if (result.rows.length === 0) {
        result = {
            ...result,
            rows: [
                {
                    id: crypto.randomUUID(),
                    highlighted: false,
                    cellValues: result.columns.map((col) => ({
                        columnId: col.id,
                        value: RichTextBlock.defaultValues(),
                    })),
                },
            ],
        };
    }

    return result;
};
