import { Calendar } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import { mergeSlotProps } from "@mui/material/utils";
import type { DateRangePickerProps as MuiDateRangePickerProps } from "@mui/x-date-pickers-pro";
import { type ComponentType, lazy, type ReactNode, Suspense, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { getOpenPickerButtonStyles, OpenPickerIcon } from "../openPickerButton";
import { getDateValue, getIsoDateString } from "../utils";

/**
 * Represents a date range with start and end dates in ISO 8601 format (YYYY-MM-DD).
 */
export type DateRange = {
    start: string | null;
    end: string | null;
};

export type DateRangePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment";

export type DateRangePickerProps = ThemedComponentBaseProps<{
    root: ComponentType<MuiDateRangePickerProps>;
    clearInputAdornment: typeof BaseClearInputAdornment;
    readOnlyAdornment: typeof ReadOnlyAdornment;
}> & {
    fullWidth?: boolean;
    /**
     * If `true`, the picker will be marked as required and the clear button will be hidden.
     */
    required?: boolean;
    /**
     * The selected date range value with start and end dates in ISO 8601 format.
     */
    value?: DateRange;
    /**
     * Callback fired when the date range changes.
     *
     * @param date - The new date range value, or `undefined` if cleared.
     */
    onChange?: (date: DateRange | undefined) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /**
     * Custom icons for the picker.
     *
     * - `openPicker`: Icon to display in the adornment that opens the calendar picker (default: Calendar icon)
     */
    iconMapping?: {
        openPicker?: ReactNode;
    };
} & Omit<MuiDateRangePickerProps, "value" | "onChange">;

const getDateRangeValue = (value: DateRange | undefined): [Date | null, Date | null] => {
    return [getDateValue(value?.start), getDateValue(value?.end)];
};

/**
 * The DateRangePicker component allows users to select a date range from a calendar interface. It provides a single
 * text field with a calendar icon that opens a date range picker dialog. The component handles ISO 8601 date strings
 * and includes features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-daterangepicker--docs)
 * - [MUI X DateRangePicker Documentation](https://mui.com/x/react-date-pickers/date-range-picker/)
 */
export const DateRangePicker = (inProps: DateRangePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        slots,
        disabled,
        value: stringDateRangeValue,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDateRangePicker",
    });
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const dateRangeValue = getDateRangeValue(stringDateRangeValue);
    const hasDateRangeValue = dateRangeValue.some((date) => date !== null);

    const { openPicker: openPickerIcon = <Calendar color="inherit" /> } = iconMapping;

    return (
        <Suspense>
            <LazyRoot
                disabled={disabled}
                readOnly={readOnly}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={dateRangeValue}
                onChange={([startDate, endDate]) => {
                    if (!startDate && !endDate) {
                        onChange?.(undefined);
                        return;
                    }

                    onChange?.({
                        start: startDate ? getIsoDateString(startDate) : null,
                        end: endDate ? getIsoDateString(endDate) : null,
                    });
                }}
                {...slotProps?.root}
                {...restProps}
                slots={{ openPickerIcon: OpenPickerIcon, ...slotProps?.root?.slots, ...slots }}
                slotProps={{
                    ...slotProps?.root?.slotProps,
                    field: (ownerState) => {
                        const externalFieldProps =
                            typeof slotProps?.root?.slotProps?.field === "function"
                                ? slotProps.root.slotProps.field(ownerState)
                                : slotProps?.root?.slotProps?.field;
                        return { openPickerButtonPosition: "start", ...externalFieldProps };
                    },
                    openPickerButton: (ownerState) => {
                        const externalOpenPickerButtonProps =
                            typeof slotProps?.root?.slotProps?.openPickerButton === "function"
                                ? slotProps.root.slotProps.openPickerButton(ownerState)
                                : slotProps?.root?.slotProps?.openPickerButton;
                        return {
                            tabIndex: -1,
                            // MUI X prevents the default of the click, which keeps the focus out of the field, so it never blurs and isn\'t marked as touched
                            onClick: () => setOpen(true),
                            edge: false,
                            "aria-label": intl.formatMessage({
                                id: "dextinity.dateRangePicker.openPicker",
                                defaultMessage: "Open date range picker",
                            }),
                            ...externalOpenPickerButtonProps,
                        };
                    },
                    openPickerIcon: (ownerState) => {
                        const externalOpenPickerIconProps =
                            typeof slotProps?.root?.slotProps?.openPickerIcon === "function"
                                ? slotProps.root.slotProps.openPickerIcon(ownerState)
                                : slotProps?.root?.slotProps?.openPickerIcon;
                        return { children: openPickerIcon, ...externalOpenPickerIconProps };
                    },
                    textField: (ownerState) => {
                        const externalTextFieldSlotProps = slotProps?.root?.slotProps?.textField;
                        const externalTextFieldProps =
                            typeof externalTextFieldSlotProps === "function" ? externalTextFieldSlotProps(ownerState) : externalTextFieldSlotProps;
                        const textFieldProps = {
                            ...externalTextFieldProps,
                            ownerState,
                        };

                        return {
                            fullWidth,
                            required,
                            onBlur,
                            onFocus,
                            ...textFieldProps,
                            slotProps: {
                                ...externalTextFieldProps?.slotProps,
                                input: mergeSlotProps(
                                    {
                                        endAdornment: (
                                            <>
                                                <ReadOnlyAdornment inputIsReadOnly={Boolean(readOnly)} {...slotProps?.readOnlyAdornment} />
                                                {hasDateRangeValue && !required && !disabled && !readOnly && (
                                                    <ClearInputAdornment
                                                        position="end"
                                                        onClick={() => onChange?.(undefined)}
                                                        {...slotProps?.clearInputAdornment}
                                                    />
                                                )}
                                            </>
                                        ),
                                    },
                                    externalTextFieldProps?.slotProps?.input ?? {},
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

    const Root = createComponentSlot(module.DateRangePicker)<DateRangePickerClassKey>({
        componentName: "DateRangePicker",
        slotName: "root",
    })(
        ({ theme }) => css`
            .${inputLabelClasses.root} {
                display: none;

                & + .${module.pickersInputBaseClasses.root} {
                    margin-top: 0;
                }
            }

            ${getOpenPickerButtonStyles(theme)}
        `,
    );

    return {
        default: (props: MuiDateRangePickerProps) => <Root {...props} />,
    };
});

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<DateRangePickerClassKey>({
    componentName: "DateRangePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDateRangePicker: DateRangePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDateRangePicker: DateRangePickerClassKey;
    }

    interface Components {
        DextinityAdminDateRangePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDateRangePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDateRangePicker"];
        };
    }
}
