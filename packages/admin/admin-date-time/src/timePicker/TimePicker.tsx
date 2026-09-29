import {
    ClearInputAdornment,
    createComponentSlot,
    InputWithPopper,
    type InputWithPopperClassKey,
    type InputWithPopperProps,
    type ThemedComponentBaseProps,
} from "@dextinity/admin";
import { Time } from "@dextinity/admin-icons";
import { type ComponentsOverrides, InputAdornment, ListItemText, MenuItem, MenuList } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { format } from "date-fns";
import { useRef } from "react";
import { type FormatDateOptions, FormattedTime, useIntl } from "react-intl";

import { getClosestDateToDate, getDateFromTimeValue, getDateRangeListByMinuteStep } from "../utils/timePickerHelpers";

export type TimePickerClassKey = InputWithPopperClassKey | "startAdornment" | "timeOptionsList" | "timeOptionItem";

type SlotProps = ThemedComponentBaseProps<{
    root: typeof InputWithPopper;
    startAdornment: typeof InputAdornment;
    timeOptionsList: typeof MenuList;
    timeOptionItem: typeof MenuItem;
}>["slotProps"];

const Root = createComponentSlot(InputWithPopper)<TimePickerClassKey>({
    componentName: "LegacyTimePicker",
    slotName: "root",
})();

const StartAdornment = createComponentSlot(InputAdornment)<TimePickerClassKey>({
    componentName: "LegacyTimePicker",
    slotName: "startAdornment",
})();

const TimeOptionsList = createComponentSlot(MenuList)<TimePickerClassKey>({
    componentName: "LegacyTimePicker",
    slotName: "timeOptionsList",
})();

const TimeOptionItem = createComponentSlot(MenuItem)<TimePickerClassKey>({
    componentName: "LegacyTimePicker",
    slotName: "timeOptionItem",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(2)} ${theme.spacing(3)};
    `,
);

export interface TimePickerProps extends Omit<InputWithPopperProps, "children" | "value" | "onChange" | "slotProps"> {
    onChange?: (time?: string) => void;
    value?: string;
    formatOptions?: FormatDateOptions;
    minuteStep?: number;
    min?: string;
    max?: string;
    required?: boolean;
    slotProps?: SlotProps;
}

/**
 * @deprecated Use `TimePicker` from `@dextinity/admin` instead.
 */
export const TimePicker = (inProps: TimePickerProps) => {
    const {
        onChange,
        value,
        formatOptions,
        endAdornment,
        required,
        minuteStep = 15,
        placeholder,
        min = "00:00",
        max = "23:59",
        slotProps,
        ...inputWithPopperProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminLegacyTimePicker" });
    const intl = useIntl();
    const focusedItemRef = useRef<HTMLLIElement>(null);

    const dateValue: Date | null = value ? getDateFromTimeValue(value) : null;
    const timeOptions = getDateRangeListByMinuteStep(min, max, minuteStep);
    const closestDateToNow = getClosestDateToDate(timeOptions);
    const closestDateToCurrentValue = dateValue ? getClosestDateToDate(timeOptions, dateValue) : null;

    const onOpenPopper = () => {
        // The timeout is necessary, as the ref might not be ready immediately when the popper starts to open.
        setTimeout(() => {
            if (focusedItemRef.current) {
                focusedItemRef.current.scrollIntoView({ behavior: "auto", block: "center" });
                focusedItemRef.current.focus();
            }
        }, 0);
    };

    return (
        <Root
            value={dateValue ? intl.formatTime(dateValue, formatOptions) : ""}
            placeholder={placeholder ?? intl.formatMessage({ id: "dextinity.timePicker.select", defaultMessage: "Select" })}
            startAdornment={
                <StartAdornment position="start" disablePointerEvents {...slotProps?.startAdornment}>
                    <Time />
                </StartAdornment>
            }
            {...inputWithPopperProps}
            slotProps={{
                ...slotProps?.root,
                paper: {
                    ...slotProps?.root?.slotProps?.paper,
                    sx: {
                        ...(slotProps?.root?.slotProps?.paper?.sx ?? {}),
                        minWidth: 110,
                        height: 280,
                        overflowY: "auto",
                    },
                },
            }}
            onOpenPopper={() => {
                onOpenPopper();
                inputWithPopperProps.onOpenPopper?.();
            }}
            readOnly
            required={required}
            endAdornment={
                !required && !inputWithPopperProps.disabled && value ? (
                    <>
                        <ClearInputAdornment position="end" onClick={() => onChange?.(undefined)} />
                        {endAdornment}
                    </>
                ) : (
                    endAdornment
                )
            }
        >
            {(closePopper) => (
                <TimeOptionsList {...slotProps?.timeOptionsList}>
                    {timeOptions.map((timeOptionValue, index) => {
                        const selected = (dateValue && format(dateValue, "HH:mm")) === format(timeOptionValue, "HH:mm");
                        const isFocusedItem =
                            selected ||
                            (closestDateToCurrentValue ? closestDateToCurrentValue === timeOptionValue : closestDateToNow === timeOptionValue);

                        return (
                            <TimeOptionItem
                                key={index}
                                selected={selected}
                                ref={isFocusedItem ? focusedItemRef : null}
                                onClick={() => {
                                    onChange?.(format(timeOptionValue, "HH:mm"));
                                    closePopper(true);
                                }}
                                {...slotProps?.timeOptionItem}
                            >
                                <ListItemText>
                                    <FormattedTime value={timeOptionValue} {...formatOptions} />
                                </ListItemText>
                            </TimeOptionItem>
                        );
                    })}
                </TimeOptionsList>
            )}
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminLegacyTimePicker: TimePickerClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminLegacyTimePicker: TimePickerProps;
    }

    interface Components {
        DextinityAdminLegacyTimePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminLegacyTimePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminLegacyTimePicker"];
        };
    }
}
