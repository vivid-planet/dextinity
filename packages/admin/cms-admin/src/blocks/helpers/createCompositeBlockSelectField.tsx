import type { SelectOption } from "@dextinity/ui";
import { SelectField, type SelectFieldProps } from "@dextinity/ui-react-final-form";
import { useIntl } from "react-intl";

import { BlocksFinalForm } from "../form/BlocksFinalForm";
import { messageText } from "../form/messageText";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

type Unpacked<T> = T extends (infer U)[] ? U : T;

type SelectFieldOptions = Pick<
    SelectFieldProps<boolean>,
    "label" | "helperText" | "placeholder" | "required" | "requiredMessage" | "disabled" | "readOnly" | "size" | "searchable" | "labels"
>;

/**
 * An option of `createCompositeBlockSelectField`. A `label` that isn't a string or a `FormattedMessage` needs a `textValue` for the
 * typeahead and the search.
 */
export type CompositeBlockSelectFieldOption<Value> = SelectOption<Value>;

interface Options<T extends string | number | string[] | number[]> extends SelectFieldOptions {
    defaultValue: T;
    options: Array<CompositeBlockSelectFieldOption<Unpacked<T>>>;
    /**
     * Allows choosing several options.
     *
     * @defaultValue `true` when `defaultValue` is a list
     */
    multiple?: boolean;
    /**
     * @deprecated Fields always fill their container. The option has no effect and will be removed.
     */
    fullWidth?: boolean;
    extractTextContents?: BlockMethods["extractTextContents"];
}

interface CompositeBlockSelectProps<Value> extends SelectFieldOptions {
    options: Array<CompositeBlockSelectFieldOption<Value>>;
    multiple: boolean;
}

function CompositeBlockSelect<Value>({ options, multiple, ...fieldProps }: CompositeBlockSelectProps<Value>) {
    const intl = useIntl();
    const optionsWithText = options.map((option) => ({ ...option, textValue: option.textValue ?? messageText(intl, option.label) }));
    return <SelectField<boolean, Value> name="value" {...fieldProps} multiple={multiple} options={optionsWithText} />;
}

export function createCompositeBlockSelectField<T extends string | number | string[] | number[]>({
    defaultValue,
    options,
    multiple = Array.isArray(defaultValue),
    fullWidth: _fullWidth,
    extractTextContents,
    ...fieldProps
}: Options<T>) {
    return createCompositeBlockField<T>({
        defaultValue,
        AdminComponent: ({ state, updateState }) => (
            <BlocksFinalForm<{ value: typeof state }> onSubmit={({ value }) => updateState(value)} initialValues={{ value: state }}>
                <CompositeBlockSelect<Unpacked<T>> {...fieldProps} options={options} multiple={multiple} />
            </BlocksFinalForm>
        ),
        extractTextContents: (state, options) => extractTextContents?.(state, options) ?? [],
    });
}
