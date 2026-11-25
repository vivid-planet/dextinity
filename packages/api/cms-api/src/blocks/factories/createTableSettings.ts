import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsOptional, ValidateNested } from "class-validator";

import { IsUndefinable } from "../../common/validators/is-undefinable.js";
import { BlockData, BlockInput } from "../block.js";
import { BlockField } from "../decorators/field.js";

type TableSettingsField =
    | { type: "select"; options: readonly string[]; defaultValue: string }
    | { type: "multiSelect"; options: readonly string[]; defaultValue: readonly string[] }
    | { type: "checkbox"; defaultValue: boolean };

export type TableSettingsDeclaration = Record<string, TableSettingsField>;

/**
 * Declares the settings of a table's rows or columns, e.g. `{ background: { type: "select", options: ["none", "grey"], defaultValue: "none" } }`.
 * Pass the result as `rowSettings` or `columnSettings` to `createTableBlock`.
 */
export function createTableSettings<const Settings extends TableSettingsDeclaration>(settings: Settings): Settings {
    return settings;
}

/**
 * The column settings of a table that doesn't pass `columnSettings`.
 * Extend them with `createTableSettings({ ...defaultTableColumnSettings, background: … })`.
 */
export const defaultTableColumnSettings = createTableSettings({
    size: { type: "select", options: ["extraSmall", "small", "standard", "large", "extraLarge"], defaultValue: "standard" },
    highlighted: { type: "checkbox", defaultValue: false },
});

/**
 * The row settings of a table that doesn't pass `rowSettings`.
 * Extend them with `createTableSettings({ ...defaultTableRowSettings, bold: … })`.
 */
export const defaultTableRowSettings = createTableSettings({
    highlighted: { type: "checkbox", defaultValue: false },
});

type TableSettingsDecorators = {
    dataField: PropertyDecorator;
    inputField: PropertyDecorator;
};

export function createTableSettingsDecorators(settings: TableSettingsDeclaration): TableSettingsDecorators {
    class TableSettingsData extends BlockData {}

    const createSettingsDataWithDefaults = (values?: object | null) => {
        const valuesByKey: Partial<Record<string, unknown>> = { ...values };

        return plainToInstance(
            TableSettingsData,
            Object.fromEntries(
                Object.entries(settings).map(([key, field]) => [
                    key,
                    valuesByKey[key] ?? (Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue),
                ]),
            ),
        );
    };

    class TableSettingsInput extends BlockInput {
        transformToBlockData(): TableSettingsData {
            return createSettingsDataWithDefaults(this);
        }
    }

    for (const [key, field] of Object.entries(settings)) {
        const { blockField, validators } = getFieldDecorators(field);

        blockField(TableSettingsData.prototype, key);
        for (const decorator of [blockField, IsUndefinable(), ...validators]) {
            decorator(TableSettingsInput.prototype, key);
        }
    }

    return {
        dataField: (target, key) => {
            BlockField(TableSettingsData)(target, key);
            // Rows and columns saved before a setting existed get its default
            Expose()(target, key);
            Transform(({ value }: { value?: object | null }) => createSettingsDataWithDefaults(value), { toClassOnly: true })(target, key);
        },
        inputField: (target, key) => {
            BlockField(TableSettingsInput)(target, key);
            IsOptional()(target, key);
            ValidateNested()(target, key);
            Type(() => TableSettingsInput)(target, key);
        },
    };
}

function getFieldDecorators(field: TableSettingsField): { blockField: PropertyDecorator; validators: PropertyDecorator[] } {
    if (field.type === "select") {
        return { blockField: BlockField({ type: "enum", enum: [...field.options] }), validators: [IsIn([...field.options])] };
    }

    if (field.type === "multiSelect") {
        return {
            blockField: BlockField({ type: "enum", enum: [...field.options], array: true }),
            validators: [IsArray(), IsIn([...field.options], { each: true })],
        };
    }

    return { blockField: BlockField({ type: "boolean" }), validators: [IsBoolean()] };
}
