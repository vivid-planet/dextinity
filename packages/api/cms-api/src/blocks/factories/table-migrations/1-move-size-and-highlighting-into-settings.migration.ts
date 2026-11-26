import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration.js";
import type { BlockMigrationInterface } from "../../migrations/types.js";
import type { TableSettingsDeclaration } from "../createTableSettings.js";

type TableSettingsValues = Partial<Record<string, unknown>>;

interface FromColumn {
    id: string;
    size?: string;
    highlighted?: boolean;
    settings?: TableSettingsValues;
}

interface FromRow {
    id: string;
    highlighted?: boolean;
    settings?: TableSettingsValues;
    cellValues: unknown[];
}

interface From {
    columns?: FromColumn[];
    rows?: FromRow[];
}

interface To {
    columns: Array<{ id: string; settings: TableSettingsValues }>;
    rows: Array<{ id: string; settings: TableSettingsValues; cellValues: unknown[] }>;
}

function pickDeclaredValues(values: TableSettingsValues, declaration: TableSettingsDeclaration): TableSettingsValues {
    return Object.fromEntries(Object.entries(values).filter(([key, value]) => Object.hasOwn(declaration, key) && value !== undefined));
}

/**
 * Moves the `size` and `highlighted` fields that rows and columns had before they became default settings into `settings`.
 * Only the settings the table declares are moved, so a table that left them out doesn't keep their values.
 */
export function buildMoveSizeAndHighlightingIntoSettingsMigration({
    columnSettings,
    rowSettings,
}: {
    columnSettings: TableSettingsDeclaration;
    rowSettings: TableSettingsDeclaration;
}): ClassConstructor<BlockMigrationInterface> {
    return class MoveSizeAndHighlightingIntoSettingsMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        public readonly toVersion = 1;

        protected migrate({ columns = [], rows = [], ...table }: From): To {
            return {
                ...table,
                columns: columns.map(({ size, highlighted, settings, ...column }) => ({
                    ...column,
                    settings: { ...pickDeclaredValues({ size, highlighted }, columnSettings), ...settings },
                })),
                rows: rows.map(({ highlighted, settings, ...row }) => ({
                    ...row,
                    settings: { ...pickDeclaredValues({ highlighted }, rowSettings), ...settings },
                })),
            };
        }
    };
}
