import type { ReactNode } from "react";

type TableSettingsOption = {
    value: string;
    label: ReactNode;
};

type TableSettingsSubmenu = {
    /** The icon of the submenu that lists the options. */
    icon?: ReactNode;
};

type TableSettingsField = {
    label: ReactNode;
} & (
    | ({ type: "select"; options: TableSettingsOption[]; defaultValue: string } & TableSettingsSubmenu)
    | ({ type: "multiSelect"; options: TableSettingsOption[]; defaultValue: string[] } & TableSettingsSubmenu)
    | { type: "checkbox"; defaultValue: boolean }
);

export type TableSettingsDeclaration = Record<string, TableSettingsField>;

export type TableSettingsState = Record<string, unknown>;

export type TableColumnWidth = {
    minWidth: number;
    flex: number;
};

export type TableCellSettings = {
    rowSettings: TableSettingsState;
    columnSettings: TableSettingsState;
};

/**
 * Declares the settings of a table's rows or columns.
 * Pass the result as `rowSettings` or `columnSettings` to `createTableBlock`.
 * The API must declare the same settings with the same defaults.
 */
export function createTableSettings<const Settings extends TableSettingsDeclaration>(settings: Settings): Settings {
    return settings;
}

const isValidValue = (field: TableSettingsField, value: unknown): boolean => {
    if (field.type === "checkbox") {
        return typeof value === "boolean";
    }

    const isOption = (optionValue: unknown) => field.options.some((option) => option.value === optionValue);

    if (field.type === "multiSelect") {
        return Array.isArray(value) && value.every(isOption);
    }

    return isOption(value);
};

export const createTableSettingsState = (settings: TableSettingsDeclaration = {}, values: TableSettingsState = {}): TableSettingsState =>
    Object.fromEntries(
        Object.entries(settings).map(([key, field]) => {
            const value = values[key];
            // Values pasted from another table can be invalid for this one
            if (isValidValue(field, value)) {
                return [key, value];
            }
            return [key, Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue];
        }),
    );
