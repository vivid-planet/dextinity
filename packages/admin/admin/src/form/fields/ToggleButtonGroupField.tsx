import { Field, type FieldProps } from "../Field";
import { FinalFormToggleButtonGroup, type FinalFormToggleButtonGroupProps } from "../FinalFormToggleButtonGroup";

export type ToggleButtonGroupFieldProps<FieldValue> = FieldProps<FieldValue, HTMLSelectElement> & FinalFormToggleButtonGroupProps<FieldValue>;

/**
 * The `ToggleButtonGroupField` is a form field component intended to be used to switch between sections in a form.
 *
 * This is especially useful when the user needs to choose between different types
 * of input for the same conceptual field — for example, selecting between an address or coordinate.
 */
export function ToggleButtonGroupField<FieldValue = unknown>({
    options,
    optionsPerRow,
    slotProps,
    sx,
    className,
    ...restProps
}: ToggleButtonGroupFieldProps<FieldValue>) {
    return (
        <Field {...restProps}>
            {(fieldProps) => {
                return (
                    <FinalFormToggleButtonGroup
                        input={fieldProps.input}
                        meta={fieldProps.meta}
                        options={options}
                        optionsPerRow={optionsPerRow}
                        disabled={fieldProps.disabled}
                        slotProps={slotProps}
                        sx={sx}
                        className={className}
                    />
                );
            }}
        </Field>
    );
}
