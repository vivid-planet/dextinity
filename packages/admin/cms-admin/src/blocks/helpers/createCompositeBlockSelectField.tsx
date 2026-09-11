import { SelectField, type SelectFieldOption, type SelectFieldProps } from "@dextinity/admin";

import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

type Unpacked<T> = T extends (infer U)[] ? U : T;

interface Options<T extends string | number | string[] | number[]> extends Partial<SelectFieldProps<Unpacked<T>>> {
    defaultValue: T;
    options: Array<SelectFieldOption<Unpacked<T>>>;
    /**
     * @deprecated Set the props directly instead of nesting inside fieldProps
     */
    fieldProps?: Partial<SelectFieldProps<Unpacked<T>>>;
    extractTextContents?: BlockMethods["extractTextContents"];
}

export function createCompositeBlockSelectField<T extends string | number | string[] | number[]>({
    defaultValue,
    options,
    fullWidth = true,
    fieldProps: legacyFieldProps,
    extractTextContents,
    ...fieldProps
}: Options<T>) {
    return createCompositeBlockField<T>({
        defaultValue,
        AdminComponent: ({ state, updateState }) => (
            <BlocksFinalForm<{ value: typeof state }> onSubmit={({ value }) => updateState(value)} initialValues={{ value: state }}>
                <SelectField name="value" fullWidth={fullWidth} {...legacyFieldProps} {...fieldProps} options={options} />
            </BlocksFinalForm>
        ),
        extractTextContents: (state, options) => extractTextContents?.(state, options) ?? [],
    });
}
