import { switchClasses } from "@mui/material";

import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiSwitch: GetMuiComponentTheme<"MuiSwitch"> = (component, { palette }) => ({
    ...component,
    defaultProps: {
        color: "primary",
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiSwitch">(component?.styleOverrides, {
        root: {
            width: 54,
            height: 34,
            padding: 9,
            display: "flex",
        },
        sizeSmall: {
            width: 46,
            height: 24,
            padding: "6px 9px",

            [`& .${switchClasses.switchBase}`]: {
                margin: "6px 9px",
                padding: 2,

                [`&.${switchClasses.checked}`]: {
                    transform: "translateX(16px)",
                },
            },
            [`& .${switchClasses.thumb}`]: {
                width: 8,
                height: 8,
            },
            [`& .${switchClasses.track}`]: {
                borderRadius: 12 / 2,
            },
        },
        switchBase: {
            margin: 9,
            padding: 3,
            color: palette.grey[200],
            "&:hover": {
                color: palette.grey[400],

                [`& + .${switchClasses.track}`]: {
                    border: `1px solid ${palette.grey[400]}`,
                },
            },

            [`&.${switchClasses.checked}`]: {
                transform: "translateX(20px)",
                color: palette.primary.main,

                [`& + .${switchClasses.track}`]: {
                    opacity: 1,
                    border: `1px solid ${palette.grey[100]}`,
                },
            },
            [`&.${switchClasses.disabled}`]: {
                color: palette.grey[100],

                [`& + .${switchClasses.track}`]: {
                    opacity: 1,
                    backgroundColor: palette.grey[50],
                    border: `1px solid ${palette.grey[100]}`,
                },
            },
        },
        colorPrimary: {
            [`&.${switchClasses.switchBase}.${switchClasses.checked}`]: {
                color: palette.primary.main,
                "&:hover": {
                    color: palette.primary.dark,

                    [`& + .${switchClasses.track}`]: {
                        border: `1px solid ${palette.primary.dark}`,
                    },
                },
            },
            [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
                backgroundColor: "#fff",
                borderColor: palette.primary.main,
            },
        },
        colorSecondary: {
            [`&.${switchClasses.switchBase}.${switchClasses.checked}`]: {
                color: palette.secondary.main,
            },
            [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
                backgroundColor: "#fff",
                borderColor: palette.secondary.main,
            },
        },
        thumb: {
            width: 10,
            height: 10,
            boxShadow: "none",
        },
        track: {
            border: `1px solid ${palette.grey[100]}`,
            boxSizing: "border-box",
            borderRadius: 16 / 2,
            opacity: 1,
            transition: "none",
            backgroundColor: "#fff",
        },
    }),
});
