import { Calendar } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import {
    DateTimePicker as MuiDateTimePicker,
    type DateTimePickerProps as MuiDateTimePickerProps,
    pickersInputBaseClasses,
} from "@mui/x-date-pickers";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { OpenPickerAdornment } from "../../common/OpenPickerAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { isValidDate } from "../utils";

export type DateTimePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment" | "openPickerAdornment";

export type DateTimePickerProps = ThemedComponentBaseProps<{
    root: typeof MuiDateTimePicker;
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
     * The selected date and time value as a Date object.
     */
    value?: Date;
    /**
     * Callback fired when the date and time changes.
     *
     * @param dateTime - The new date and time value, or `undefined` if cleared.
     */
    onChange?: (dateTime: Date | undefined) => void;
    /**
     * Custom icons for the picker.
     *
     * - `openPicker`: Icon to display in the adornment that opens the picker (default: Calendar icon)
     */
    onBlur?: () => void;
    onFocus?: () => void;
    iconMapping?: {
        openPicker?: ReactNode;
    };
} & Omit<MuiDateTimePickerProps, "value" | "onChange">;

/**
 * The DateTimePicker component allows users to select both a date and time from a combined picker interface.
 * It provides a text field with a calendar icon that opens a date-time picker dialog. The component handles
 * Date objects and includes features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datetimepicker--docs)
 * - [MUI X DateTimePicker Documentation](https://mui.com/x/react-date-pickers/date-time-picker/)
 */
export const DateTimePicker = (inProps: DateTimePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        disabled,
        value = null,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDateTimePicker",
    });
    const [open, setOpen] = useState(false);
    const intl = useIntl();

    const { openPicker: openPickerIcon = <Calendar color="inherit" /> } = iconMapping;

    return (
        <Root
            disabled={disabled}
            readOnly={readOnly}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={value}
            onChange={(date) => {
                const dateIsInvalid = date !== null && !isValidDate(date);
                if (dateIsInvalid) {
                    return;
                }

                onChange?.(date || undefined);
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
                                                id: "dextinity.dateTimePicker.openPicker",
                                                defaultMessage: "Open date time picker",
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
                                    {value !== null && !required && !disabled && !readOnly && (
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

const Root = createComponentSlot(MuiDateTimePicker)<DateTimePickerClassKey>({
    componentName: "DateTimePicker",
    slotName: "root",
})(css`
    .${inputLabelClasses.root} {
        display: none;

        & + .${pickersInputBaseClasses.root} {
            margin-top: 0;
        }
    }
`);

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<DateTimePickerClassKey>({
    componentName: "DateTimePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDateTimePicker: DateTimePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDateTimePicker: DateTimePickerClassKey;
    }

    interface Components {
        DextinityAdminDateTimePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDateTimePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDateTimePicker"];
        };
    }
}
