import { type DateRange, DateRangePicker, type DateRangePickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface DateRangeFieldProps<FieldValue = DateRange | null>
    extends
        Omit<FieldAdapterBaseProps, "required">,
        FinalFormFieldConfig<FieldValue, DateRange | null>,
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
 * A `DateRangePicker` connected to a React Final Form field: `{ start, end }` with days as `YYYY-MM-DD`, or `null` for none. Shows the
 * field's error once it was touched or the form was submitted.
 */
export const DateRangeField = memo(
    forwardRef(function DateRangeField<FieldValue = DateRange | null>(
        { name, actions, onFocus, ...props }: DateRangeFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLInputElement>,
    ) {
        const [options, dateRangePickerProps] = splitFieldAdapterProps(props);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, DateRange | null, HTMLInputElement>(name, { ...options, isEmpty: isIncompleteDateRange }, forwardedRef);
        const value = toDateRangeValue(input.value);

        return (
            <DateRangePicker
                {...dateRangePickerProps}
                {...validationProps}
                ref={ref}
                name={input.name}
                value={value}
                required={options.required}
                actions={renderActions(actions, value, input.onChange)}
                onChange={input.onChange}
                onBlur={onBlur}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            />
        );
    }),
) as <FieldValue = DateRange | null>(props: DateRangeFieldProps<FieldValue> & RefAttributes<HTMLInputElement>) => ReactNode;
