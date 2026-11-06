import { SelectField } from "@dextinity/ui-react-final-form";
import type { ReactNode } from "react";
import { useField } from "react-final-form";

import type { ColumnsBlockLayout } from "../createColumnsBlock";
import { LayoutPreviewPrefix, useLayoutSelectOptions } from "./LayoutSelect";

export interface LayoutSelectFieldProps {
    /** The field's path in the form values. The field holds the chosen `ColumnsBlockLayout`. */
    name: string;
    label: ReactNode;
    /** The layouts to choose from. With a single layout, the field shows it read-only. */
    layouts: ColumnsBlockLayout[];
    helperText?: ReactNode;
    disabled?: boolean;
}

/**
 * Chooses a layout of a columns block in a React Final Form form, showing each layout's preview in the menu.
 */
export function LayoutSelectField({ name, label, layouts, helperText, disabled }: LayoutSelectFieldProps) {
    const options = useLayoutSelectOptions(layouts);
    const {
        input: { value },
    } = useField<ColumnsBlockLayout | undefined>(name, { subscription: { value: true } });

    return (
        <SelectField<false, string, ColumnsBlockLayout | undefined>
            name={name}
            label={label}
            helperText={helperText}
            disabled={disabled}
            options={options}
            readOnly={layouts.length === 1}
            prefix={value ? <LayoutPreviewPrefix>{value.preview}</LayoutPreviewPrefix> : undefined}
            format={(layout) => layout?.name ?? null}
            parse={(layoutName) => layouts.find((layout) => layout.name === layoutName)}
            isEqual={(layoutA, layoutB) => layoutA?.name === layoutB?.name}
        />
    );
}
