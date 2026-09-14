import { iconButtonClasses, inputAdornmentClasses } from "@mui/material";
import type { Components, Theme } from "@mui/material/styles";
import { pickersInputBaseClasses, pickersInputClasses, pickersSectionListClasses } from "@mui/x-date-pickers";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";

export const getMuiPickersInputBase = (
    component: Components["MuiPickersInputBase"],
    { palette, spacing }: Theme,
): Components["MuiPickersInputBase"] => ({
    ...component,
    styleOverrides: mergeOverrideStyles(component?.styleOverrides, {
        root: {
            border: `1px solid ${palette.grey[100]}`,
            borderRadius: 2,
            backgroundColor: "#fff",
            paddingLeft: spacing(2),
            paddingRight: spacing(2),

            // Hide the input underline
            "&:before, &:after": {
                display: "none",
            },

            [`&.${pickersInputBaseClasses.focused}`]: {
                borderColor: palette.primary.main,
            },

            [`&.${pickersInputBaseClasses.disabled}`]: {
                borderColor: palette.grey[100],
                backgroundColor: palette.grey[50],
                color: palette.text.disabled,
            },

            [`&.${pickersInputBaseClasses.readOnly}`]: {
                borderColor: palette.grey[100],
                backgroundColor: palette.grey[50],
            },

            [`&:hover:not(.${pickersInputBaseClasses.disabled}):not(.${pickersInputBaseClasses.focused})`]: {
                borderColor: palette.grey[200],
            },

            [`&.${pickersInputClasses.adornedStart}`]: {
                paddingLeft: spacing(2),

                [`& .${iconButtonClasses.root}`]: {
                    marginLeft: -8,
                    marginRight: -8,
                },
            },

            [`&.${pickersInputClasses.adornedEnd}`]: {
                paddingRight: spacing(2),

                [`& .${iconButtonClasses.root}`]: {
                    marginRight: -8,
                    marginLeft: -8,
                },
            },

            [`.DextinityAdminClearInputAdornment-root.${inputAdornmentClasses.positionStart}`]: {
                marginLeft: spacing(-2),
            },

            [`.DextinityAdminClearInputAdornment-root.${inputAdornmentClasses.positionEnd}`]: {
                marginRight: spacing(-2),
            },
        },
        sectionsContainer: {
            height: "auto",
            boxSizing: "border-box",
            padding: `calc(${spacing(2)} - 1px)`,
            lineHeight: "20px",

            "&::-ms-clear": {
                display: "none",
            },

            [`& > .${pickersSectionListClasses.section}`]: {
                lineHeight: "20px",

                [`.${pickersInputBaseClasses.sectionContent}`]: {
                    lineHeight: "20px",
                },
            },
        },
    }),
});
