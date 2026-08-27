import { Calendar } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import { DatePicker as MuiDatePicker, type DatePickerProps as MuiDatePickerProps, pickersInputBaseClasses } from "@mui/x-date-pickers";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { OpenPickerAdornment } from "../../common/OpenPickerAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { getDateValue, getIsoDateString, isValidDate } from "../utils";

export type DatePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment" | "openPickerAdornment";

export type DatePickerProps = ThemedComponentBaseProps<{
    root: typeof MuiDatePicker;
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
     * The selected date value in ISO 8601 format (YYYY-MM-DD).
     */
    value?: string;
    /**
     * Callback fired when the date changes.
     *
     * @param date - The new date value in ISO 8601 format (YYYY-MM-DD), or `undefined` if cleared.
     */
    onChange?: (date: string | undefined) => void;
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
} & Omit<MuiDatePickerProps, "value" | "onChange" | "slotProps">;

/**
 * The DatePicker component allows users to select a date from a calendar interface. It provides a text field
 * with a calendar icon that opens a date picker dialog. The component handles ISO 8601 date strings and includes
 * features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datepicker--docs)
 * - [MUI X DatePicker Documentation](https://mui.com/x/react-date-pickers/date-picker/)
 */
export const DatePicker = (inProps: DatePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        disabled,
        value: stringValue,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDatePicker",
    });
    const [open, setOpen] = useState(false);
    const intl = useIntl();
    const dateValue = getDateValue(stringValue);

    const { openPicker: openPickerIcon = <Calendar color="inherit" /> } = iconMapping;

    return (
        <Root
            disabled={disabled}
            readOnly={readOnly}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={dateValue}
            onChange={(date) => {
                let newStringValue: string | undefined = undefined;

                if (date && isValidDate(date)) {
                    newStringValue = getIsoDateString(date);
                }

                return onChange?.(newStringValue);
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
                                                id: "dextinity.datePicker.openPicker",
                                                defaultMessage: "Open date picker",
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
                                    {dateValue !== null && !required && !disabled && !readOnly && (
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
    );
};

const Root = createComponentSlot(MuiDatePicker)<DatePickerClassKey>({
    componentName: "DatePicker",
    slotName: "root",
})(css`
    .${inputLabelClasses.root} {
        display: none;

        & + .${pickersInputBaseClasses.root} {
            margin-top: 0;
        }
    }
`);

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<DatePickerClassKey>({
    componentName: "DatePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDatePicker: DatePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDatePicker: DatePickerClassKey;
    }

    interface Components {
        DextinityAdminDatePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDatePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDatePicker"];
        };
    }
}
