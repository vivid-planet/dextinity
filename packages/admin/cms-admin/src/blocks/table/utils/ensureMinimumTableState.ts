import { v4 as uuid } from "uuid";

import type { TableBlockState } from "../../createTableBlock";
import type { BlockInterface } from "../../types";

export const ensureMinimumTableState = (state: TableBlockState, RichTextBlock: BlockInterface): TableBlockState => {
    let result = state;

    if (result.columns.length === 0) {
        const newColumnId = uuid();
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
                    id: uuid(),
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
