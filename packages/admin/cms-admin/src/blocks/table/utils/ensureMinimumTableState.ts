import { v4 as uuid } from "uuid";

import type { TableBlockState } from "../../createTableBlock";
import { createTableSettingsState } from "../createTableSettings";
import type { TableBlockConfig } from "../TableBlockContext";

export const ensureMinimumTableState = (state: TableBlockState, { CellBlock, rowSettings, columnSettings }: TableBlockConfig): TableBlockState => {
    let result = state;

    if (result.columns.length === 0) {
        const newColumnId = uuid();
        result = {
            ...result,
            columns: [{ id: newColumnId, settings: createTableSettingsState(columnSettings) }],
            rows: result.rows.map((row) => ({
                ...row,
                cellValues: [...row.cellValues, { columnId: newColumnId, value: CellBlock.defaultValues() }],
            })),
        };
    }

    if (result.rows.length === 0) {
        result = {
            ...result,
            rows: [
                {
                    id: uuid(),
                    settings: createTableSettingsState(rowSettings),
                    cellValues: result.columns.map((col) => ({
                        columnId: col.id,
                        value: CellBlock.defaultValues(),
                    })),
                },
            ],
        };
    }

    return result;
};
