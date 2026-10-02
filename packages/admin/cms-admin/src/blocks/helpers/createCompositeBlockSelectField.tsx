import { SelectField, type SelectFieldOption, type SelectFieldProps } from "@dextinity/admin";

import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

type Unpacked<T> = T extends (infer U)[] ? U : T;
type OptionValue<T> = Unpacked<NonNullable<T>>;

interface Options<T extends string | number | string[] | number[] | undefined> extends Partial<SelectFieldProps<OptionValue<T>>> {
    defaultValue: T;
    options: Array<SelectFieldOption<OptionValue<T>>>;
    /**
     * @deprecated Set the props directly instead of nesting inside fieldProps
     */
    fieldProps?: Partial<SelectFieldProps<OptionValue<T>>>;
    extractTextContents?: BlockMethods["extractTextContents"];
}

export function createCompositeBlockSelectField<T extends string | number | string[] | number[] | undefined>({
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
