import { createComponentSlot, InputWithPopper, type InputWithPopperClassKey, type ThemedComponentBaseProps } from "@dextinity/admin";
import { InputAdornment } from "@mui/material";
import type { CSSProperties } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { Calendar as CalendarBase } from "react-date-range";

import { getReactDateRangeStyles } from "../utils/getReactDateRangeStyles";

export type DatePickerClassKey = InputWithPopperClassKey | "calendar" | "startAdornment";

export type SlotProps = ThemedComponentBaseProps<{
    root: typeof InputWithPopper;
    startAdornment: typeof InputAdornment;
    calendar: typeof CalendarBase;
}>["slotProps"];

export const Root = createComponentSlot(InputWithPopper)<DatePickerClassKey>({
    componentName: "LegacyDatePicker",
    slotName: "root",
})();

export const StartAdornment = createComponentSlot(InputAdornment)<DatePickerClassKey>({
    componentName: "LegacyDatePicker",
    slotName: "startAdornment",
})();

export const Calendar = createComponentSlot(CalendarBase)<DatePickerClassKey>({
    componentName: "LegacyDatePicker",
    slotName: "calendar",
})(({ theme }) =>
    deepmerge<CSSProperties>(getReactDateRangeStyles(theme), {
        "& .rdrMonth:first-child:last-child .rdrMonthName": {
            display: "none",
        },
        "& .rdrDayStartPreview": {
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            left: 4,
        },
        "& .rdrDayEndPreview": {
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            right: 4,
        },
        "& .rdrDay": {
            "& .rdrSelected": {
                top: 0,
                bottom: 0,
                left: 4,
                right: 4,
                borderRadius: 4,
                backgroundColor: theme.palette.primary.main,

                "& ~ .rdrDayNumber span": {
                    fontWeight: theme.typography.fontWeightBold,
                    color: "white",
                },
                "& ~ .rdrDayStartPreview, & ~ .rdrDayEndPreview": {
                    display: "none",

                    "& ~ .rdrDayNumber span": {
                        color: "white",
                    },
                },
            },
            "& .rdrSelected ~ .rdrDayNumber span": {
                fontWeight: theme.typography.fontWeightBold,
            },
            "&.rdrDayPassive .rdrSelected ~ .rdrDayNumber span": {
                color: theme.palette.grey[100],
                fontWeight: theme.typography.fontWeightRegular,
            },
            "&.rdrDayToday": {
                "&.rdrDayPassive": {
                    "& .rdrSelected, & .rdrDayStartPreview, & .rdrDayEndPreview": {
                        "&  ~ .rdrDayNumber span": {
                            color: theme.palette.grey[100],
                        },
                    },
                    "& .rdrSelected": {
                        backgroundColor: theme.palette.grey[50],
                        display: "block",

                        "&  ~ .rdrDayNumber span": {
                            color: theme.palette.grey[100],
                        },
                    },
                },
                "& .rdrSelected ~ .rdrDayNumber span": {
                    fontWeight: theme.typography.fontWeightBold,
                },
            },
        },

        "& .rdrDayStartOfMonth .rdrDayInPreview, & .rdrDayStartOfMonth .rdrDayEndPreview, & .rdrDayStartOfWeek .rdrDayInPreview, & .rdrDayStartOfWeek .rdrDayEndPreview":
            {
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
            },
        "& .rdrDayEndOfMonth .rdrDayInPreview, & .rdrDayEndOfMonth .rdrDayStartPreview, & .rdrDayEndOfWeek .rdrDayInPreview, & .rdrDayEndOfWeek .rdrDayStartPreview":
            {
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
            },

        "& .rdrDayStartPreview.rdrDayEndPreview": {
            right: 4,
            left: 4,
        },
    }),
);
