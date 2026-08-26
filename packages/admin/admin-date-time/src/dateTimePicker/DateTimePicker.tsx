import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import { type ComponentsOverrides, FormControl, type InputBaseProps } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { useRef } from "react";
import { useIntl } from "react-intl";

import { DatePicker as DatePickerBase } from "../datePicker/DatePicker";
import { TimePicker as TimePickerBase } from "../timePicker/TimePicker";
import { getIsoDateString } from "../utils/datePickerHelpers";
import { getDateWithNewTime, getTimeStringFromDate } from "../utils/timePickerHelpers";

export type DateTimePickerClassKey = "root" | "dateFormControl" | "timeFormControl" | "datePicker" | "timePicker";

const Root = createComponentSlot("div")<DateTimePickerClassKey>({
    componentName: "LegacyDateTimePicker",
    slotName: "root",
})(
    ({ theme }) => css`
        ${theme.breakpoints.up("sm")} {
            display: flex;
            align-items: center;
        }
    `,
);

const DateFormControl = createComponentSlot(FormControl)<DateTimePickerClassKey>({
    componentName: "LegacyDateTimePicker",
    slotName: "dateFormControl",
})(
    ({ theme }) => css`
        margin-bottom: ${theme.spacing(2)};
        width: 100%;

        ${theme.breakpoints.up("sm")} {
            flex-grow: 1;
            margin-right: ${theme.spacing(2)};
            margin-bottom: 0;
            width: auto;
        }
    `,
);

const TimeFormControl = createComponentSlot(FormControl)<DateTimePickerClassKey>({
    componentName: "LegacyDateTimePicker",
    slotName: "timeFormControl",
})(
    ({ theme }) => css`
        width: 100%;
        flex-grow: 1;

        ${theme.breakpoints.up("sm")} {
            width: auto;
        }
    `,
);

const DatePicker = createComponentSlot(DatePickerBase)<DateTimePickerClassKey>({
    componentName: "LegacyDateTimePicker",
    slotName: "datePicker",
})(
    () => css`
        .MuiInputBase-input {
            text-overflow: ellipsis;
        }
    `,
);

const TimePicker = createComponentSlot(TimePickerBase)<DateTimePickerClassKey>({
    componentName: "LegacyDateTimePicker",
    slotName: "timePicker",
})(
    () => css`
        .MuiInputBase-input {
            text-overflow: ellipsis;
        }
    `,
);

export interface DateTimePickerProps
    extends ThemedComponentBaseProps<{
        root: "div";
        dateFormControl: typeof FormControl;
        timeFormControl: typeof FormControl;
        datePicker: typeof DatePickerBase;
        timePicker: typeof TimePickerBase;
    }> {
    onChange?: (value?: Date) => void;
    value?: Date;
    required?: boolean;
    disabled?: boolean;
    onBlur?: InputBaseProps["onBlur"];
    onFocus?: InputBaseProps["onFocus"];
}

/**
 * @deprecated Use `DateTimePicker` from `@dextinity/admin` instead.
 */
export const DateTimePicker = (inProps: DateTimePickerProps) => {
    const { onChange, value, required, disabled, slotProps, onBlur, onFocus, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminLegacyDateTimePicker",
    });
    const intl = useIntl();
    const datePickerRef = useRef<HTMLElement>(null);
    const timePickerRef = useRef<HTMLElement>(null);

    const onChangeDate = (newDate?: string) => {
        if (newDate === undefined) {
            onChange?.(undefined);
        } else {
            const timePickerShouldBeFocused = !value;
            const time = getTimeStringFromDate(value ? value : new Date());
            const newDateTime = getDateWithNewTime(new Date(newDate), time);
            onChange?.(newDateTime);

            if (timePickerShouldBeFocused) {
                timePickerRef.current?.focus();
            }
        }
    };

    const onChangeTime = (newTime?: string) => {
        if (newTime === undefined) {
            onChange?.(undefined);
        } else {
            const datePickerShouldBeFocused = !value;
            const date = value ? value : new Date();
            const newDateTime = getDateWithNewTime(date, newTime);
            onChange?.(newDateTime);

            if (datePickerShouldBeFocused) {
                datePickerRef.current?.focus();
            }
        }
    };

    return (
        <Root {...slotProps?.root} {...restProps}>
            <DateFormControl {...slotProps?.dateFormControl}>
                <DatePicker
                    inputRef={datePickerRef}
                    value={value ? getIsoDateString(value) : undefined}
                    onChange={onChangeDate}
                    fullWidth
                    required={required}
                    disabled={disabled}
                    {...slotProps?.datePicker}
                    onBlur={(event) => {
                        onBlur?.(event);
                        slotProps?.datePicker?.onBlur?.(event);
                    }}
                    onFocus={(event) => {
                        onFocus?.(event);
                        slotProps?.datePicker?.onFocus?.(event);
                    }}
                />
            </DateFormControl>
            <TimeFormControl {...slotProps?.timeFormControl}>
                <TimePicker
                    inputRef={timePickerRef}
                    value={value ? getTimeStringFromDate(value) : undefined}
                    placeholder={intl.formatMessage({ id: "dextinity.timeTimePicker.time", defaultMessage: "Time" })}
                    onChange={onChangeTime}
                    fullWidth
                    required={required}
                    disabled={disabled}
                    {...slotProps?.timePicker}
                    onBlur={(event) => {
                        onBlur?.(event);
                        slotProps?.timePicker?.onBlur?.(event);
                    }}
                    onFocus={(event) => {
                        onFocus?.(event);
                        slotProps?.timePicker?.onFocus?.(event);
                    }}
                />
            </TimeFormControl>
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminLegacyDateTimePicker: DateTimePickerClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminLegacyDateTimePicker: DateTimePickerProps;
    }

    interface Components {
        DextinityAdminLegacyDateTimePicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminLegacyDateTimePicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminLegacyDateTimePicker"];
        };
    }
}
