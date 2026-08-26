import { Time } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import type { TimeRangePickerProps as MuiTimeRangePickerProps } from "@mui/x-date-pickers-pro";
import { type ComponentType, lazy, type ReactNode, Suspense, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { OpenPickerAdornment } from "../../common/OpenPickerAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { getDateFromTimeString, getTimeStringFromDate, isValidDate } from "../utils";

/**
 * Represents a time range with start and end times in 24-hour format (HH:mm).
 */
export type TimeRange = {
    start: string | null;
    end: string | null;
};

export type TimeRangePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment" | "openPickerAdornment";

export type TimeRangePickerProps = ThemedComponentBaseProps<{
    root: ComponentType<MuiTimeRangePickerProps>;
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
     * The selected time range value with start and end times in 24-hour format (HH:mm).
     */
    value?: TimeRange;
    /**
     * Callback fired when the time range changes.
     *
     * @param time - The new time range value, or `undefined` if cleared.
     */
    onChange?: (time: TimeRange | undefined) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /**
     * Custom icons for the picker.
     *
     * - `openPicker`: Icon to display in the adornment that opens the time range picker (default: Time icon)
     */
    iconMapping?: {
        openPicker?: ReactNode;
    };
} & Omit<MuiTimeRangePickerProps, "value" | "onChange">;

const getTimeRangeValue = (value: TimeRange | undefined): [Date | null, Date | null] => {
    return [getDateFromTimeString(value?.start), getDateFromTimeString(value?.end)];
};

/**
 * The TimeRangePicker component allows users to select a time range from a time picker interface. It provides two
 * text fields with a time icon that opens a time range picker dialog. The component handles time strings in 24-hour
 * format (HH:mm) and includes features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-timerangepicker--docs)
 * - [MUI X TimeRangePicker Documentation](https://mui.com/x/react-date-pickers/time-range-picker/)
 */
export const TimeRangePicker = (inProps: TimeRangePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        disabled,
        value: stringTimeRangeValue,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminTimeRangePicker",
    });
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const timeRangeValue = getTimeRangeValue(stringTimeRangeValue);
    const hasTimeRangeValue = timeRangeValue.some((time) => time !== null);

    const { openPicker: openPickerIcon = <Time color="inherit" /> } = iconMapping;

    return (
        <Suspense>
            <LazyRoot
                disabled={disabled}
                readOnly={readOnly}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={timeRangeValue}
                onChange={([startTime, endTime]) => {
                    const startTimeIsInvalid = startTime !== null && !isValidDate(startTime);
                    const endTimeIsInvalid = endTime !== null && !isValidDate(endTime);

                    if (startTimeIsInvalid || endTimeIsInvalid) {
                        return;
                    }

                    if (!startTime && !endTime) {
                        onChange?.(undefined);
                        return;
                    }

                    onChange?.({
                        start: startTime ? getTimeStringFromDate(startTime) : null,
                        end: endTime ? getTimeStringFromDate(endTime) : null,
                    });
                }}
                {...slotProps?.root}
                {...restProps}
                slotProps={{
                    ...slotProps?.root?.slotProps,
                    field: {
                        dateSeparator: intl.formatMessage({ id: "dextinity.timeRangePicker.separator", defaultMessage: "to" }),
                        ...slotProps?.root?.slotProps?.field,
                    },
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
                                                    id: "dextinity.timeRangePicker.openPicker",
                                                    defaultMessage: "Open time range picker",
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
                                        {hasTimeRangeValue && !required && !disabled && !readOnly && (
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

    const Root = createComponentSlot(module.TimeRangePicker)<TimeRangePickerClassKey>({
        componentName: "TimeRangePicker",
        slotName: "root",
    })(css`
        // Hide the per-field "Start"/"End" labels, which aren't part of the design.
        .${inputLabelClasses.root} {
            display: none;

            & + .${module.pickersInputBaseClasses.root} {
                margin-top: 0;
            }
        }
    `);

    return {
        default: (props: MuiTimeRangePickerProps) => <Root {...props} slots={{ field: module.MultiInputTimeRangeField, ...props.slots }} />,
    };
});

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<TimeRangePickerClassKey>({
    componentName: "TimeRangePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTimeRangePicker: TimeRangePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTimeRangePicker: TimeRangePickerClassKey;
    }

    interface Components {
        DextinityAdminTimeRangePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTimeRangePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTimeRangePicker"];
        };
    }
}
