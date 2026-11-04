import type { Theme } from "@mui/material";
import type { CSSProperties } from "@mui/material/styles";

export const getReactDateRangeStyles = ({ palette, typography }: Theme): CSSProperties => ({
    backgroundColor: "transparent",

    "&.rdrCalendarWrapper:not(.rdrDateRangeWrapper) .rdrDayHovered .rdrDayNumber:after": {
        display: "none",
    },
    "& .rdrMonth": {
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,

        "&:not(:last-child)": {
            borderRight: `1px solid ${palette.grey[50]}`,
        },
        "& .rdrMonthName": {
            textAlign: "center",
            fontFamily: typography.fontFamily,
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: typography.fontWeightBold,
            color: palette.grey[300],
            marginTop: 16,
            padding: 0,
        },
    },
    "& .rdrWeekDay": {
        fontSize: typography.body2.fontSize,
        lineHeight: typography.body2.lineHeight,
        fontWeight: typography.fontWeightBold,
        color: palette.grey[600],
        marginTop: 16,
    },
    "& .rdrDay": {
        height: 36,
        marginBottom: 2,

        "&.rdrDayPassive .rdrDayNumber span": {
            color: palette.grey[100],

            "&:after": {
                backgroundColor: "currentColor",
            },
        },
        "& .rdrDayNumber": {
            zIndex: 1,
            fontFamily: typography.fontFamily,
            fontSize: typography.body2.fontSize,
            lineHeight: typography.body2.lineHeight,
            fontWeight: typography.fontWeightRegular,

            "& span:after": {
                width: 12,
                bottom: 1,
                backgroundColor: palette.primary.main,
            },
        },
        "&.rdrDayToday": {
            "& .rdrDayNumber span": {
                fontWeight: typography.fontWeightRegular,
            },
        },
        "&.rdrDayPassive": {
            "& .rdrDayStartPreview, & .rdrDayEndPreview": {
                "&  ~ .rdrDayNumber span": {
                    color: palette.grey[100],
                },
            },
        },
        "& .rdrDayStartPreview, & .rdrDayEndPreview": {
            backgroundColor: palette.grey[50],
            top: 0,
            bottom: 0,
            border: "none",

            "& ~ .rdrDayNumber span": {
                color: palette.text.primary,
            },
        },
    },
});
