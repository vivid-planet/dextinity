import { inputBaseClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiInputBase: GetMuiComponentTheme<"MuiInputBase"> = (component, { palette, spacing }) => ({
    ...component,
    styleOverrides: mergeOverrideStyles<"MuiInputBase">(component?.styleOverrides, {
        root: {
            border: `1px solid ${palette.grey[100]}`,
            borderRadius: 2,
            backgroundColor: "#fff",

            [`&.${inputBaseClasses.focused}`]: {
                borderColor: palette.primary.main,
            },

            [`&.${inputBaseClasses.disabled}`]: {
                borderColor: palette.grey[100],
                backgroundColor: palette.grey[50],
            },

            [`&:hover:not(.${inputBaseClasses.disabled}):not(.${inputBaseClasses.focused})`]: {
                borderColor: palette.grey[200],
            },
        },
        adornedStart: {
            paddingLeft: spacing(2),
        },
        adornedEnd: {
            paddingRight: spacing(2),
        },
        multiline: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        input: {
            height: "auto",
            boxSizing: "border-box",
            padding: `calc(${spacing(2)} - 1px)`,
            lineHeight: "20px",

            "&::-ms-clear": {
                display: "none",
            },
        },
        inputMultiline: {
            padding: `calc(${spacing(2)} - 1px)`,
            resize: "vertical",
        },
        inputAdornedStart: {
            paddingLeft: spacing(2),
        },
        inputAdornedEnd: {
            paddingRight: spacing(2),
        },
    }),
});
