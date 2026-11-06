import { type DateRange, DateRangePicker, type DateRangePickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface DateRangeFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        Omit<FieldAdapterBaseProps<TFieldValues, TName>, "required">,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<DateRangePickerProps, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /**
     * Marks the field as required and validates that both the start and the end are set.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<DateRange | null>;
}

export function toDateRangeValue(value: unknown): DateRange | null {
    if (value == null || typeof value !== "object") {
        return null;
    }
    const { start, end } = value as Partial<DateRange>;
    return { start: typeof start === "string" && start !== "" ? start : null, end: typeof end === "string" && end !== "" ? end : null };
}

export function isIncompleteDateRange(value: unknown) {
    const range = toDateRangeValue(value);
    return range?.start == null || range.end == null;
}

/**
 * A `DateRangePicker` connected to a React Hook Form field: `{ start, end }` with days as `YYYY-MM-DD`, or `null` for none. Shows the
 * field's error once it was touched or the form was submitted.
 */
export const DateRangeField = forwardRef(function DateRangeField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, actions, ...props }: DateRangeFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
) {
    const [options, dateRangePickerProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLInputElement>(
        { name, ...options, isEmpty: isIncompleteDateRange },
        forwardedRef,
    );
    const value = toDateRangeValue(field.value);

    return (
        <DateRangePicker
            {...dateRangePickerProps}
            {...validationProps}
            ref={ref}
            name={field.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, field.onChange)}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: DateRangeFieldProps<TFieldValues, TName> & RefAttributes<HTMLInputElement>,
) => ReactNode;
