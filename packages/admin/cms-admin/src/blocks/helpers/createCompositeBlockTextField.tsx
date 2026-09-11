import { TextField, type TextFieldProps } from "@dextinity/admin";

import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

interface Options extends Partial<TextFieldProps> {
    defaultValue?: string;
    /**
     * @deprecated Set the props directly instead of nesting inside fieldProps
     */
    fieldProps?: Partial<TextFieldProps>;
    extractTextContents?: BlockMethods["extractTextContents"];
    translateContent?: BlockMethods["translateContent"];
}

export function createCompositeBlockTextField({
    defaultValue = "",
    fullWidth = true,
    fieldProps: legacyFieldProps,
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
                <TextField name="value" fullWidth={fullWidth} {...legacyFieldProps} {...fieldProps} />
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
