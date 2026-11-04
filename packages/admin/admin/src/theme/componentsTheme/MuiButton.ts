import { buttonClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiButton: GetMuiComponentTheme<"MuiButton"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        disableElevation: true,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiButton">(component?.styleOverrides, {
        root: {
            position: "relative",
            fontSize: 16,
            lineHeight: "16px",
            letterSpacing: 0,
            textTransform: "none",
            fontWeight: 250,
            minWidth: "auto",

            "& .MuiButton-startIcon": {
                marginRight: "6px",
            },

            "& .MuiButton-endIcon": {
                marginLeft: "6px",
            },

            [`&.${buttonClasses.textSizeSmall}`]: {
                fontSize: 14,
                lineHeight: "20px",
            },
        },
        text: ({ ownerState }) => ({
            paddingTop: 12,
            paddingRight: 15,
            paddingBottom: 12,
            paddingLeft: 15,
            borderRadius: 4,

            [`& .${buttonClasses.startIcon}`]: {
                marginRight: 5,
            },

            [`& .${buttonClasses.endIcon}`]: {
                marginLeft: 5,
            },

            "&:hover": {
                color: palette.primary.main,
                backgroundColor: "inherit",
            },

            "&:focus": {
                outline: `2px solid ${palette.primary.dark}`,
                outlineOffset: -2,
            },

            ...(ownerState.color === "info" && {
                color: palette.grey[900],

                ":hover": {
                    backgroundColor: palette.grey[50],
                },
            }),
        }),
        contained: {
            paddingTop: 12,
            paddingRight: 15,
            paddingBottom: 12,
            paddingLeft: 15,
            borderRadius: 4,

            "&:focus": {
                outline: `2px solid ${palette.primary.dark}`,
                outlineOffset: -2,
            },
        },
        containedPrimary: {
            color: palette.primary.contrastText,
            borderColor: palette.primary.main,

            "&:hover": {
                backgroundColor: palette.primary.dark,
                borderColor: palette.primary.dark,
            },

            "&:focus": {
                backgroundColor: palette.primary.main,
                outline: `2px solid ${palette.primary.dark}`,
            },

            [`&.${buttonClasses.disabled}`]: {
                backgroundColor: palette.grey[100],
                color: palette.grey[200],
            },
        },
        containedSecondary: {
            color: palette.secondary.contrastText,
            borderColor: palette.secondary.main,

            "&:hover": {
                backgroundColor: palette.secondary.dark,
                borderColor: palette.secondary.dark,
            },

            "&:focus": {
                outline: `2px solid ${palette.primary.dark}`,
            },

            [`&.${buttonClasses.disabled}`]: {
                backgroundColor: palette.grey[100],
                color: palette.secondary.contrastText,
            },
        },
        containedSuccess: {
            "&:hover": {
                backgroundColor: palette.success.dark,
            },

            "&:focus": {
                outline: `2px solid ${palette.success.dark}`,
            },

            [`&.${buttonClasses.disabled}`]: {
                backgroundColor: palette.secondary.main,
                color: palette.secondary.contrastText,
                opacity: 0.2,
            },
        },
        outlined: {
            color: palette.common.black,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: palette.grey[100],
            paddingTop: 11,
            paddingRight: 14,
            paddingBottom: 11,
            paddingLeft: 14,
            borderRadius: 4,

            ":hover": {
                borderColor: palette.grey[900],
            },

            ":focus": {
                paddingTop: 10,
                paddingRight: 13,
                paddingBottom: 10,
                paddingLeft: 13,
                border: `2px solid ${palette.primary.dark}`,
            },

            [`&.${buttonClasses.disabled}`]: {
                borderColor: palette.grey[100],
                color: palette.grey[100],
            },
        },
        outlinedError: {
            color: palette.error.main,
            borderColor: palette.error.main,
            backgroundColor: palette.common.white,

            "&:hover": {
                color: palette.error.dark,
                borderColor: palette.error.dark,
                backgroundColor: palette.grey[50],
            },

            "&:focus": {
                border: `2px solid ${palette.error.main}`,
            },

            [`&.${buttonClasses.disabled}`]: {
                borderColor: palette.error.main,
                color: palette.error.main,
                opacity: 0.2,
            },
        },
        startIcon: {
            marginLeft: 0,

            [`&.${buttonClasses.iconSizeMedium} > *:first-of-type`]: {
                fontSize: 16,
            },
        },
        endIcon: {
            marginRight: 0,

            [`&.${buttonClasses.iconSizeMedium} > *:first-of-type`]: {
                fontSize: 16,
            },
        },
    }),
});
