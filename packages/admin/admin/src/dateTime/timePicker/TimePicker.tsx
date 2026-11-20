import { Time } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, inputLabelClasses, type Theme, useThemeProps } from "@mui/material";
import { mergeSlotProps } from "@mui/material/utils";
import { pickersInputBaseClasses, TimePicker as MuiTimePicker, type TimePickerProps as MuiTimePickerProps } from "@mui/x-date-pickers";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { ClearInputAdornment as BaseClearInputAdornment } from "../../common/ClearInputAdornment";
import { ReadOnlyAdornment } from "../../common/ReadOnlyAdornment";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { getOpenPickerButtonStyles, OpenPickerIcon } from "../openPickerButton";
import { getDateFromTimeString, getTimeStringFromDate } from "../utils";

export type TimePickerClassKey = "root" | "clearInputAdornment" | "readOnlyAdornment";

export type TimePickerProps = ThemedComponentBaseProps<{
    root: typeof MuiTimePicker;
    clearInputAdornment: typeof BaseClearInputAdornment;
    readOnlyAdornment: typeof ReadOnlyAdornment;
}> & {
    fullWidth?: boolean;
    /**
     * If `true`, the picker will be marked as required and the clear button will be hidden.
     */
    required?: boolean;
    /**
     * The selected time value in 24-hour format (HH:mm).
     */
    value?: string;
    /**
     * Callback fired when the time changes.
     *
     * @param time - The new time value in 24-hour format (HH:mm), or `undefined` if cleared.
     */
    onChange?: (time: string | undefined) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    /**
     * Custom icons for the picker.
     *
     * - `openPicker`: Icon to display in the adornment that opens the time picker (default: Time icon)
     */
    iconMapping?: {
        openPicker?: ReactNode;
    };
} & Omit<MuiTimePickerProps, "value" | "onChange" | "slotProps">;

/**
 * The TimePicker component allows users to select a time from a time picker interface. It provides a text field
 * with a time icon that opens a time picker dialog. The component handles time strings in 24-hour format (HH:mm)
 * and includes features like clearing, read-only state, and customizable icons.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-timepicker--docs)
 * - [MUI X TimePicker Documentation](https://mui.com/x/react-date-pickers/time-picker/)
 */
export const TimePicker = (inProps: TimePickerProps) => {
    const {
        iconMapping = {},
        fullWidth,
        required,
        slotProps,
        slots,
        disabled,
        value: stringValue,
        onChange,
        onBlur,
        onFocus,
        readOnly,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminTimePicker",
    });
    const [open, setOpen] = useState(false);
    const intl = useIntl();
    const dateValue = getDateFromTimeString(stringValue);

    const { openPicker: openPickerIcon = <Time color="inherit" /> } = iconMapping;

    return (
        <Root
            disabled={disabled}
            readOnly={readOnly}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={dateValue}
            onChange={(date) => {
                if (!date) {
                    onChange?.(undefined);
                    return;
                }

                onChange?.(getTimeStringFromDate(date));
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
                            id: "dextinity.timePicker.openPicker",
                            defaultMessage: "Open time picker",
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
                                externalTextFieldProps?.slotProps?.input ?? {},
                            ),
                        },
                    };
                },
            }}
        />
    );
};

const Root = createComponentSlot(MuiTimePicker)<TimePickerClassKey>({
    componentName: "TimePicker",
    slotName: "root",
})(
    ({ theme }) => css`
        .${inputLabelClasses.root} {
            display: none;

            & + .${pickersInputBaseClasses.root} {
                margin-top: 0;
            }
        }

        ${getOpenPickerButtonStyles(theme)}
    `,
);

const ClearInputAdornment = createComponentSlot(BaseClearInputAdornment)<TimePickerClassKey>({
    componentName: "TimePicker",
    slotName: "clearInputAdornment",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTimePicker: TimePickerProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTimePicker: TimePickerClassKey;
    }

    interface Components {
        DextinityAdminTimePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTimePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTimePicker"];
        };
    }
}
