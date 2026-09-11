import { Calendar } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import type { DateTimeRangePickerProps as MuiDateTimeRangePickerProps } from "@mui/x-date-pickers-pro";
import { type ComponentType, lazy, type ReactNode, Suspense, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { OpenPickerAdornment } from "../../common/OpenPickerAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { isValidDate } from "../utils";

/**
 * Represents a date-time range with start and end dates as Date objects.
 */
export type DateTimeRange = {
    start: Date | null;
    end: Date | null;
};

export type DateTimeRangePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment" | "openPickerAdornment";

export type DateTimeRangePickerProps = ThemedComponentBaseProps<{
    root: ComponentType<MuiDateTimeRangePickerProps>;
    clearInputAdornment: typeof BaseClearInputAdornment;
    readOnlyAdornment: typeof ReadOnlyAdornment;
    openPickerAdornment: typeof OpenPickerAdornment;
}> & {
    fullWidth?: boolean;
    /**
     * If `true`, the picker will be marked as required and the clear button will be hidden.
     */
    required?: boolean;
    /**
     * The selected date-time range value with start and end as Date objects.
     */
    value?: DateTimeRange;
    /**
     * Callback fired when the date-time range changes.
     *
     * @param date - The new date-time range value, or `undefined` if cleared.
     */
    onChange?: (date: DateTimeRange | undefined) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /**
     * Custom icons for the picker.
     *
     * - `openPicker`: Icon to display in the adornment that opens the picker (default: Calendar icon)
     */
    iconMapping?: {
        openPicker?: ReactNode;
    };
} & Omit<MuiDateTimeRangePickerProps, "value" | "onChange">;

/**
 * The DateTimeRangePicker component allows users to select a date-time range from a combined picker interface.
 * It provides two text fields with a calendar icon that opens a date-time range picker dialog. The component handles
 * Date objects and includes features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datetimerangepicker--docs)
 * - [MUI X DateTimeRangePicker Documentation](https://mui.com/x/react-date-pickers/date-time-range-picker/)
 */
export const DateTimeRangePicker = (inProps: DateTimeRangePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        disabled,
        value: valueObject,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDateTimeRangePicker",
    });
    const intl = useIntl();

    const [open, setOpen] = useState(false);
    const arrayValue: [Date | null, Date | null] = valueObject ? [valueObject.start, valueObject.end] : [null, null];

    const { openPicker: openPickerIcon = <Calendar color="inherit" /> } = iconMapping;

    return (
        <Suspense>
            <LazyRoot
                disabled={disabled}
                readOnly={readOnly}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={arrayValue}
                onChange={([startDate, endDate]) => {
                    const startDateIsInvalid = startDate !== null && !isValidDate(startDate);
                    const endDateIsInvalid = endDate !== null && !isValidDate(endDate);

                    if (startDateIsInvalid || endDateIsInvalid) {
                        return;
                    }

                    if (!startDate && !endDate) {
                        onChange?.(undefined);
                        return;
                    }

                    onChange?.({
                        start: startDate,
                        end: endDate,
                    });
                }}
                {...slotProps?.root}
                {...restProps}
                slotProps={{
                    ...slotProps?.root?.slotProps,
                    textField: (ownerState) => {
                        const textFieldProps = {
                            ...slotProps?.root?.slotProps?.textField,
                            ownerState,
                        };

                        return {
                            fullWidth,
                            required,
                            onBlur,
                            onFocus,
                            ...textFieldProps,
                            InputProps: {
                                startAdornment: (
                                    <OpenPickerAdornment
                                        inputIsDisabled={disabled}
                                        inputIsReadOnly={readOnly}
                                        onClick={() => setOpen(true)}
                                        {...slotProps?.openPickerAdornment}
                                        slotProps={{
                                            ...slotProps?.openPickerAdornment?.slotProps,
                                            openPickerButton: {
                                                "aria-label": intl.formatMessage({
                                                    id: "dextinity.dateTimeRangePicker.openPicker",
                                                    defaultMessage: "Open date time range picker",
                                                }),
                                                ...slotProps?.openPickerAdornment?.slotProps?.openPickerButton,
                                            },
                                        }}
                                    >
                                        {openPickerIcon}
                                    </OpenPickerAdornment>
                                ),
                                endAdornment: (
                                    <>
                                        <ReadOnlyAdornment inputIsReadOnly={Boolean(readOnly)} {...slotProps?.readOnlyAdornment} />
                                        {arrayValue.some((date) => date !== null) && !required && !disabled && !readOnly && (
                                            <ClearInputAdornment
                                                position="end"
                                                onClick={() => onChange?.(undefined)}
                                                {...slotProps?.clearInputAdornment}
                                            />
                                        )}
                                    </>
                                ),
                            },
                        };
                    },
                }}
            />
        </Suspense>
    );
};

const LazyRoot = lazy(async () => {
    const module = await import("@mui/x-date-pickers-pro");

    const Root = createComponentSlot(module.DateTimeRangePicker)<DateTimeRangePickerClassKey>({
        componentName: "DateTimeRangePicker",
        slotName: "root",
    })(css`
        .${inputLabelClasses.root} {
            display: none;

            & + .${module.pickersInputBaseClasses.root} {
                margin-top: 0;
            }
        }
    `);

    return {
        default: (props: MuiDateTimeRangePickerProps) => <Root {...props} slots={{ field: module.MultiInputDateTimeRangeField, ...props.slots }} />,
    };
});

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<DateTimeRangePickerClassKey>({
    componentName: "DateTimeRangePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDateTimeRangePicker: DateTimeRangePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDateTimeRangePicker: DateTimeRangePickerClassKey;
    }

    interface Components {
        DextinityAdminDateTimeRangePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDateTimeRangePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDateTimeRangePicker"];
        };
    }
}
