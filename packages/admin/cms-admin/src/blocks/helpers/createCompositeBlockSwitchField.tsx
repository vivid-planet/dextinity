import { SwitchField, type SwitchFieldProps } from "@dextinity/ui-react-final-form";
import type { ReactNode } from "react";

import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockMethods } from "../types";
import { createCompositeBlockField } from "./composeBlocks/createCompositeBlockField";

interface Options extends Pick<SwitchFieldProps, "description" | "disabled" | "required" | "requiredMessage" | "size" | "validate" | "warn"> {
    /** The text next to the switch. */
    label: ReactNode;
    defaultValue?: boolean;
    /**
     * @deprecated Fields always fill their container. The option has no effect and will be removed.
     */
    fullWidth?: boolean;
    extractTextContents?: BlockMethods["extractTextContents"];
}

export function createCompositeBlockSwitchField({ defaultValue = false, label, fullWidth: _fullWidth, extractTextContents, ...fieldProps }: Options) {
    return createCompositeBlockField<boolean>({
        defaultValue,
        AdminComponent: ({ state, updateState }) => (
            <BlocksFinalForm<{ value: typeof state }> onSubmit={({ value }) => updateState(value)} initialValues={{ value: state }}>
                <SwitchField name="value" {...fieldProps}>
                    {label}
                </SwitchField>
            </BlocksFinalForm>
        ),
        extractTextContents: (state, options) => extractTextContents?.(state, options) ?? [],
    });
}
