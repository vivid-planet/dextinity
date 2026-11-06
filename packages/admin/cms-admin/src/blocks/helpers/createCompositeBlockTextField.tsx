import { BlockInputField, type BlockInputFieldProps, BlockTextareaField } from "../form/BlockInputField";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

type TextFieldOptions = Pick<
    BlockInputFieldProps,
    | "label"
    | "helperText"
    | "placeholder"
    | "required"
    | "requiredMessage"
    | "disabled"
    | "readOnly"
    | "size"
    | "prefix"
    | "suffix"
    | "actions"
    | "maxLength"
    | "showCount"
    | "validate"
    | "warn"
    | "disableContentTranslation"
>;

interface Options extends TextFieldOptions {
    defaultValue?: string;
    /**
     * Shows a multi-line textarea instead of a single-line input.
     *
     * @defaultValue `false`
     */
    multiline?: boolean;
    /** Visible lines of the textarea at the start, with `multiline`. */
    rows?: number;
    /**
     * @deprecated Fields always fill their container. The option has no effect and will be removed.
     */
    fullWidth?: boolean;
    extractTextContents?: BlockMethods["extractTextContents"];
    translateContent?: BlockMethods["translateContent"];
}

export function createCompositeBlockTextField({
    defaultValue = "",
    multiline = false,
    rows,
    fullWidth: _fullWidth,
    extractTextContents,
    translateContent,
    ...fieldProps
}: Options) {
    return createCompositeBlockField<string>({
        defaultValue,
        AdminComponent: ({ state, updateState }) => (
            <BlocksFinalForm<{ value: typeof state }>
                onSubmit={({ value }) => updateState(value ?? "")}
                initialValues={{ value: state || undefined }}
            >
                {multiline ? <BlockTextareaField name="value" rows={rows} {...fieldProps} /> : <BlockInputField name="value" {...fieldProps} />}
            </BlocksFinalForm>
        ),
        extractTextContents,
        translateContent:
            translateContent ??
            (async (state: string, translate: (text: string) => Promise<string>) => {
                return state.length > 0 ? translate(state) : state;
            }),
    });
}
